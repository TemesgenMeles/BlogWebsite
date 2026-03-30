# Deploying Your Full-Stack App to cPanel

Deploying a modern full-stack application (React Frontend + Django Backend + PostgreSQL) to cPanel involves three main phases. I have proactively generated a `requirements.txt` file in your `Backend` folder to make this process easier for you.

> [!NOTE]
> This guide assumes your cPanel host supports **Setup Python App** (via CloudLinux) and **PostgreSQL databases**. If you only have Shared Hosting without Python support, you may need a VPS for the backend.

---

## Part 1: Setting up the PostgreSQL Database

1. Log into your cPanel dashboard.
2. Under the **Databases** section, click on **PostgreSQL Databases** (or PostgreSQL Database Wizard).
3. **Create a Database**: Give your database a name (e.g., `yourapp_db`).
4. **Create a User**: Scroll down to Add New User, create a username (e.g., `yourapp_user`), and generate a strong password. Save this password!
5. **Add User to Database**: Scroll down to "Add User To Database", select the user and database you just created, and grant all privileges.

---

## Part 2: Deploying the Django Backend

### 2.1 Prepare the Environment
1. In cPanel, locate **Setup Python App** under the Software section.
2. Click **Create Application**.
3. Select the best matching **Python Version** (e.g., 3.10+).
4. **Application root**: Enter a directory name for your backend (e.g., `backend_app`). 
5. **Application URL**: Choose a subdomain or route for your API (e.g., `api.yourdomain.com`).
6. Click **Create**. This creates a virtual environment on your server.

### 2.2 Upload Your Code
1. Open cPanel's **File Manager**.
2. Navigate to the `backend_app` directory created in the previous step.
3. Zip your local `Backend` folder (do not include the `apienv` folder or `db.sqlite3`).
4. Upload the zip file into `backend_app` and extract it.

### 2.3 Install Dependencies
1. Go back to **Setup Python App** in cPanel.
2. Edit your running app. You will see a command at the top that looks like `source /home/user/virtualenv/backend_app/3.10/bin/activate`.
3. SSH into your server (or use the cPanel Terminal), paste that command to activate the environment.
4. Run: `pip install -r requirements.txt`. (I just created this file for you locally).

### 2.4 Configure Django Production Settings
In your server's File Manager, edit `backend_app/From_My_Life/settings.py` (or do this locally before uploading):
- Set `DEBUG = False`.
- Set `ALLOWED_HOSTS = ['api.yourdomain.com', 'yourdomain.com']`.
- Set `CORS_ALLOWED_ORIGINS = ['https://yourdomain.com']`.
- Add `STATIC_ROOT = os.path.join(BASE_DIR, 'static')` at the bottom.

In your server's `.env` file (create it in `backend_app/`), add the PostgreSQL credentials from Part 1:
```env
DB_NAME=your_cpanel_dbname
DB_USER=your_cpanel_dbuser
DB_PASSWORD=your_cpanel_dbpassword
DB_HOST=127.0.0.1
DB_PORT=5432
```

### 2.5 Run Migrations and Connect WSGI
1. In your activated SSH terminal, run: `python manage.py collectstatic`.
2. Run database migrations: `python manage.py migrate`.
3. In File Manager, find the `passenger_wsgi.py` file inside your `backend_app` root. Replace its contents with:
```python
from From_My_Life.wsgi import application
```
4. Go back to **Setup Python App** and **Restart** the application. Your API should now be live.

---

## Part 3: Deploying the React Frontend

### 3.1 Build Your App
1. Locally on your computer, navigate to `Frontend/From_My_Life`.
2. Update the API calls in your React app to point to your new live backend URL (e.g., `https://api.yourdomain.com` instead of `http://localhost:8000`). This is usually defined in an `.env` file in the frontend or inside your custom Axios instances.
3. Run `npm run dev` locally and verify the API calls work, then run `npm run build`. This generates a `dist` folder.

### 3.2 Upload Your Build
1. Zip the **contents** of the `dist` folder.
2. In cPanel's **File Manager**, navigate to your `public_html` directory (or the document root of your primary domain).
3. Upload the zip file here and map it to extraction.
4. Delete the zip file. Provide an `.htaccess` file if you are using React Router to ensure navigation works correctly.

> [!TIP]
> **React Router .htaccess configuration:**
> For React single-page apps (SPAs), create a `.htaccess` file in `public_html` with this snippet:
> ```apache
> <IfModule mod_rewrite.c>
>   RewriteEngine On
>   RewriteBase /
>   RewriteRule ^index\.html$ - [L]
>   RewriteCond %{REQUEST_FILENAME} !-f
>   RewriteCond %{REQUEST_FILENAME} !-d
>   RewriteRule . /index.html [L]
> </IfModule>
> ```
