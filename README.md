npm install
npm run build
docker-compose build
docker-compose up -d
затем в .env
DATABASE_URL=postgresql://postgres:postgres@db:5432/mydatabase
поменять на
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mydatabase
выполнить команды
npm run load-data
npm run seed-users
