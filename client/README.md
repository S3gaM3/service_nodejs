# User Management Client

Клиентское приложение для управления пользователями.

## Технологии

- **React 18** - UI библиотека
- **TypeScript** - типизированный JavaScript
- **Vite** - сборщик и dev-сервер
- **React Router** - маршрутизация
- **Axios** - HTTP клиент

## Установка

```bash
cd client
npm install
```

## Разработка

```bash
npm run dev
```

Приложение будет доступно на `http://localhost:3001`

## Сборка

```bash
npm run build
```

## Настройка

Создайте файл `.env` в папке `client`:

```
VITE_API_URL=http://localhost:3000/api
```

Для production укажите URL вашего API на Vercel.

## Структура

```
client/
├── src/
│   ├── api/          # API клиент
│   ├── components/   # React компоненты
│   ├── context/      # React Context (Auth)
│   ├── pages/        # Страницы приложения
│   ├── types/        # TypeScript типы
│   └── main.tsx      # Точка входа
└── package.json
```

## Функциональность

- ✅ Регистрация пользователей
- ✅ Авторизация
- ✅ Просмотр списка пользователей (только для админов)
- ✅ Просмотр детальной информации о пользователе
- ✅ Блокировка пользователей
- ✅ Защищенные маршруты
- ✅ Управление состоянием аутентификации

