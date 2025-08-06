import os

# Struktur folder dan file
structure = {
    "controllers": [
        "authController.js",
        "categoryController.js",
        "productController.js"
    ],
    "models": [
        "db.js",
        "adminUserModel.js",
        "categoryModel.js",
        "productModel.js"
    ],
    "routes": [
        "authRoutes.js",
        "categoryRoutes.js",
        "productRoutes.js"
    ],
    "views/admin": [
        "login.ejs",
        "dashboard.ejs",
        "categories.ejs",
        "products.ejs"
    ],
    "views/public": [
        "index.ejs",
        "convert-pulsa.ejs",
        "gestun-paylater.ejs"
    ],
    "public": [],
    "middleware": [
        "authMiddleware.js"
    ]
}

# Nama folder utama
base_path = "project_structure"

def create_structure():
    for folder, files in structure.items():
        folder_path = os.path.join(base_path, folder)
        os.makedirs(folder_path, exist_ok=True)
        
        for file_name in files:
            file_path = os.path.join(folder_path, file_name)
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write("")  # membuat file kosong

    # Membuat file app.js dan server.js di root
    for file in ['app.js', 'server.js']:
        with open(os.path.join(base_path, file), 'w', encoding='utf-8') as f:
            f.write("")

    print(f"✅ Struktur proyek berhasil dibuat di folder: {base_path}")

if __name__ == "__main__":
    create_structure()
