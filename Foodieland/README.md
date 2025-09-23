## Các bước chạy dự án

- Cài vendor
npm i        (frontend)
composer i   (backend)

- Cài thư viện biểu đồ 
npm install chart.js react-chartjs-2 (frontend)

- Cài thư viện lịch
npm install react-datepicker date-fns (frontend)

- Cài thư viện lucide-react
npm install lucide-react

- Cài thư viện toastify
npm install react-toastify

- Copy .env và sửa lại DB   (backend)
WINDOW:           copy .env.example .env
LINUX | UBUNTU:   cp .env.example .env

- GENERATE KEY   (backend)
php artisan key:generate

- MIGRATE & SEED   (backend)
php artisan migrate --seed

- SERVE
npm run dev         (frontend)
php artisan serve   (backend)
