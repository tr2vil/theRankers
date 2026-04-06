"""한경 컨센서스 리포트 크롤러.

한경 컨센서스(markets.hankyung.com)에서 종목별 애널리스트 리포트를 수집한다.
window.__NUXT__ IIFE에서 인자값을 추출하고, 함수 본문의 변수 참조를 해석하여 데이터를 복원.
"""

import json
import re
import logging
from dataclasses import dataclass
from datetime import date

import httpx

logger = logging.getLogger(__name__)

BASE_URL = "https://markets.hankyung.com"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "ko-KR,ko;q=0.9",
}


@dataclass
class RawReport:
    """크롤링된 리포트 원본 데이터."""
    analyst_name: str
    firm: str
    stock_code: str
    stock_name: str
    opinion: str
    target_price: int
    report_date: date
    title: str | None = None
    source_url: str | None = None


async def fetch_stock_reports(stock_code: str) -> list[RawReport]:
    """종목 코드로 한경 컨센서스 리포트를 수집한다."""
    url = f"{BASE_URL}/stock/{stock_code}/consensus"

    try:
        async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
            res = await client.get(url, headers=HEADERS)
            res.raise_for_status()

        reports = _parse_nuxt_iife(res.text, stock_code)
        logger.info(f"[{stock_code}] {len(reports)}건 리포트 수집 완료")
        return reports

    except httpx.HTTPStatusError as e:
        logger.warning(f"[{stock_code}] HTTP {e.response.status_code}")
    except Exception as e:
        logger.error(f"[{stock_code}] 수집 실패: {e}")

    return []


def _parse_nuxt_iife(html: str, stock_code: str) -> list[RawReport]:
    """window.__NUXT__ IIFE에서 리포트 데이터를 추출한다.

    구조: window.__NUXT__=(function(a,b,...){return {...}}(val1,val2,...))
    - 함수 본문에서 recentReports 배열의 변수 참조 패턴을 추출
    - IIFE 인자값 배열에서 실제 값을 매핑
    """
    # 1. IIFE 인자값 추출
    args = _extract_iife_args(html)
    if not args:
        return []

    # 2. 함수 본문에서 recentReports 패턴 추출
    body = _extract_iife_body(html)
    if not body:
        return []

    # 3. 변수명→인자 인덱스 매핑 생성
    param_names = _extract_param_names(html)
    if not param_names:
        return []

    var_map = dict(zip(param_names, args))

    # 4. recentReports 배열에서 각 리포트 객체 추출
    reports = _extract_reports_from_body(body, var_map, stock_code)
    return reports


def _extract_iife_args(html: str) -> list[str]:
    """IIFE 호출부의 인자값 배열을 추출한다."""
    idx = html.find("window.__NUXT__")
    if idx == -1:
        return []

    nuxt_block = html[idx:]
    script_end = nuxt_block.find("</script>")
    if script_end == -1:
        return []
    nuxt_block = nuxt_block[:script_end]

    # 마지막 }( 이후가 인자값
    last_bracket = nuxt_block.rfind("}(")
    if last_bracket == -1:
        return []

    args_part = nuxt_block[last_bracket + 2:]
    # 끝의 )) 또는 )); 제거
    args_part = args_part.rstrip("; \n\r\t")
    if args_part.endswith("))"):
        args_part = args_part[:-2]
    elif args_part.endswith(")"):
        args_part = args_part[:-1]

    return _split_js_args(args_part)


def _split_js_args(args_str: str) -> list[str]:
    """JavaScript 함수 인자 문자열을 분리한다."""
    args = []
    current = []
    depth = 0
    in_string = False
    string_char = None

    for ch in args_str:
        if in_string:
            current.append(ch)
            if ch == string_char and (not current or current[-2] != '\\'):
                in_string = False
            continue

        if ch in ('"', "'"):
            in_string = True
            string_char = ch
            current.append(ch)
        elif ch == ',' and depth == 0:
            args.append(''.join(current).strip())
            current = []
        elif ch in ('(', '[', '{'):
            depth += 1
            current.append(ch)
        elif ch in (')', ']', '}'):
            depth -= 1
            current.append(ch)
        else:
            current.append(ch)

    if current:
        args.append(''.join(current).strip())

    return args


def _extract_param_names(html: str) -> list[str]:
    """IIFE 함수의 매개변수 이름 목록을 추출한다."""
    pattern = r'window\.__NUXT__=\(function\(([^)]+)\)'
    match = re.search(pattern, html)
    if not match:
        return []
    return [p.strip() for p in match.group(1).split(',')]


def _extract_iife_body(html: str) -> str:
    """IIFE 함수 본문을 추출한다."""
    pattern = r'window\.__NUXT__=\(function\([^)]+\)\{return\s*(\{.+?\})\}\('
    match = re.search(pattern, html, re.DOTALL)
    if not match:
        return ""
    return match.group(1)


def _resolve_value(raw: str, var_map: dict) -> str:
    """변수 참조를 실제 값으로 해석한다."""
    raw = raw.strip()
    if raw in var_map:
        val = var_map[raw]
        # 문자열 따옴표 제거
        if len(val) >= 2 and val[0] == '"' and val[-1] == '"':
            return val[1:-1]
        return val
    # 리터럴 값
    if len(raw) >= 2 and raw[0] == '"' and raw[-1] == '"':
        return raw[1:-1]
    return raw


def _extract_reports_from_body(body: str, var_map: dict, stock_code: str) -> list[RawReport]:
    """함수 본문에서 recentReports 배열의 리포트 객체들을 추출한다."""
    reports = []

    # recentReports:[ 시작점 찾기
    rr_idx = body.find("recentReports:[")
    if rr_idx == -1:
        return reports

    start = rr_idx + len("recentReports:[")

    # 중첩 배열/객체를 고려하여 최상위 { } 쌍을 추출
    depth = 0
    obj_start = None
    for i in range(start, len(body)):
        ch = body[i]
        if ch == '{':
            if depth == 0:
                obj_start = i + 1
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0 and obj_start is not None:
                obj_str = body[obj_start:i]
                # 중첩 객체(analysts 등) 전의 최상위 필드만 추출
                report = _parse_report_object(obj_str, var_map, stock_code)
                if report:
                    reports.append(report)
                obj_start = None
        elif ch == ']' and depth == 0:
            break

    return reports


def _parse_report_object(obj_str: str, var_map: dict, stock_code: str) -> RawReport | None:
    """단일 리포트 객체 문자열을 파싱한다."""
    try:
        # key:value 쌍 추출
        fields = {}
        for pair in re.finditer(r'(\w+):([^,}]+)', obj_str):
            key = pair.group(1)
            raw_val = pair.group(2).strip()
            fields[key] = _resolve_value(raw_val, var_map)

        analyst_name = fields.get("REPORT_WRITER", "").strip()
        firm = fields.get("OFFICE_NAME", "").strip()
        opinion_raw = fields.get("GRADE_VALUE", "").strip()
        target_str = fields.get("TARGET_STOCK_PRICES", "0").replace(",", "")
        report_date_str = fields.get("REPORT_DATE", "")
        stock_name = fields.get("BUSINESS_NAME", "")
        title = fields.get("REPORT_TITLE", "")
        code = fields.get("BUSINESS_CODE", stock_code)

        if not analyst_name or not firm:
            return None

        opinion = _normalize_opinion(opinion_raw)
        if not opinion:
            return None

        target_price = int(float(target_str))
        if target_price <= 0:
            return None

        report_date = date.fromisoformat(report_date_str[:10])

        return RawReport(
            analyst_name=analyst_name,
            firm=firm,
            stock_code=code,
            stock_name=stock_name,
            opinion=opinion,
            target_price=target_price,
            report_date=report_date,
            title=title or None,
            source_url=f"{BASE_URL}/stock/{code}/consensus",
        )
    except (ValueError, TypeError) as e:
        logger.debug(f"리포트 파싱 실패: {e}")
        return None


def _normalize_opinion(raw: str) -> str | None:
    """투자의견을 매수/중립/매도로 정규화."""
    raw_upper = raw.strip().upper()
    buy_keywords = ("매수", "BUY", "STRONG BUY", "적극매수", "OUTPERFORM", "OVERWEIGHT")
    hold_keywords = ("중립", "HOLD", "NEUTRAL", "MARKETPERFORM", "MARKET PERFORM", "시장수익률")
    sell_keywords = ("매도", "SELL", "UNDERPERFORM", "UNDERWEIGHT", "비중축소")

    for kw in buy_keywords:
        if kw in raw_upper or kw in raw:
            return "매수"
    for kw in hold_keywords:
        if kw in raw_upper or kw in raw:
            return "중립"
    for kw in sell_keywords:
        if kw in raw_upper or kw in raw:
            return "매도"
    return None
