Инструкция по устранению проблем:
bash
# 1. Проверьте подключение к БД отдельно
npm run test-db

# 2. Если не подключается, попробуйте через psql:
psql "postgresql://data_node_user:Ba8BCs7ERZaKvi3KuhoGRZklFsWBh7mt@dpg-d8o7co6rnols73cn1eb0-a.oregon-postgres.render.com:5432/data_node"

# 3. Проверьте, что база данных существует
# Если нет - создайте через Render.com dashboard

# 4. Убедитесь, что ваш IP добавлен в белый список
# На Render.com: Database → Settings → Allow connections from

# 5. Попробуйте добавить SSL параметр в URL:
# postgresql://data_node_user:Ba8BCs7ERZaKvi3KuhoGRZklFsWBh7mt@dpg-d8o7co6rnols73cn1eb0-a.oregon-postgres.render.com:5432/data_node?sslmode=require

# 6. Запустите миграцию снова
npm run migrate
9. Альтернативный способ - локальная БД для разработки:
Если удаленная БД не подключается, используйте локальную для разработки:

env
# Используйте локальную БД для разработки
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/modeling_db
Создайте локальную базу:

bash
psql -U postgres -c "CREATE DATABASE modeling_db;"
10. Проверка подключения через Node.js:
bash
# Установите дополнительный пакет для диагностики
npm install -g pg-connection-string

# Проверьте строку подключения
node -e "const { parse } = require('pg-connection-string'); console.log(parse('postgresql://data_node_user:Ba8BCs7ERZaKvi3KuhoGRZklFsWBh7mt@dpg-d8o7co6rnols73cn1eb0-a.oregon-postgres.render.com:5432/data_node'));"
Основные исправления:
✅ Добавлен порт :5432 в URL

✅ Увеличен таймаут подключения

✅ Добавлены повторные попытки подключения

✅ Добавлен SSL для production

✅ Добавлен скрипт для диагностики

✅ Исправлена обработка ошибок

✅ Добавлен graceful shutdown

После всех исправлений запустите:

bash
npm run test-db
npm run migrate
npm run dev
Если проблема сохраняется, проверьте:

Доступность базы данных в Render.com

Правильность пароля и имени пользователя

Настройки firewall

Используйте ?sslmode=require в конце URL