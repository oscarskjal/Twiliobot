# 🐔 ChickenBot - Twilio chicken Joke Bot

A simple Twilio bot that responds to SMS messages with classic "why did the chicken cross the road" jokes!

## Route

**Production URL**: https://chickenbot-bm1l.onrender.com/

## API Endpoints

| Endpoint       | Method | Description                                                     |
| -------------- | ------ | --------------------------------------------------------------- |
| `/`            | GET    | Health check - returns bot status                               |
| `/voice`       | POST   | Twilio voice webhook - initial greeting and menu                |
| `/handle-menu` | POST   | Twilio voice webhook - handles menu selections (Digits: 1 or 2) |

### Run Tests

```bash
npm test                 # Run all tests
npm run test:coverage    # With coverage
npm run test:watch       # Watch mode
```

## Infrastructure as Code

- **Dockerfile**: Containerized deployment configuration
- **render.yaml**: Render platform
- **.github/workflows/deploy.yml**: CI/CD pipeline configuration

## CI/CD Pipeline

**Workflow**: [.github/workflows/deploy.yml](.github/workflows/deploy.yml)

On push to `main`:

1. Run tests
2. Deploy to Render
3. Tag release as `prod-YYYY-MM-DD`
