"""Celery Beat 스케줄 설정."""

from celery.schedules import crontab
from app.tasks import celery_app

celery_app.conf.beat_schedule = {
    # 매일 오전 7시: 최신 리포트 수집
    "collect-latest-reports": {
        "task": "collect_latest_reports",
        "schedule": crontab(hour=7, minute=0),
    },
    # 매일 오후 4시 30분 (장 마감 후): 주가 업데이트
    "update-stock-prices": {
        "task": "update_stock_prices",
        "schedule": crontab(hour=16, minute=30),
        "kwargs": {"days_back": 7},
    },
    # 매일 오후 5시: 추적 가격 업데이트
    "update-tracked-prices": {
        "task": "update_tracked_prices",
        "schedule": crontab(hour=17, minute=0),
    },
    # 매주 월요일 오전 6시: 전체 종목 리포트 수집
    "collect-all-stocks-weekly": {
        "task": "collect_all_major_stocks",
        "schedule": crontab(hour=6, minute=0, day_of_week=1),
    },
    # 매일 오후 6시: 랭킹 재계산
    "calculate-rankings-daily": {
        "task": "calculate_rankings",
        "schedule": crontab(hour=18, minute=0),
    },
}
