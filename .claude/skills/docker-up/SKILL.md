---
name: docker-up
description: Docker Compose 서비스를 시작한다.
user_invocable: true
---

# /docker-up

Docker Compose 서비스를 시작한다.

```bash
cd "C:/Users/admin/Documents/1. Project/2. AI/theRankers"
docker-compose up -d
docker-compose ps
```

시작 후 각 서비스 상태를 확인하고 보고한다:
- PostgreSQL 연결 가능 여부
- Redis 연결 가능 여부
- Backend 서비스 health check
- Celery 워커 동작 상태
