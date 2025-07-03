db.createUser({
    user: "masterbikes",
    pwd: "password123",
    roles: [
        { role: "readWrite", db: "masterbikes" }
    ]
});

db.createCollection("productos_venta");
db.createCollection("bicicletas_arriendo");