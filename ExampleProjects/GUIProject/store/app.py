from pathlib import Path

from flask import Flask, jsonify, render_template, request

from database import db
from models import Product, Order, ProductsOrder

from datetime import datetime

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///store.db"
app.instance_path = Path(".").resolve()
db.init_app(app)


@app.route("/")
def home():
    data = Product.query.all()
    return render_template("index.html", products=data)


@app.route("/api/product/<string:name>", methods=["GET"])
def api_get_product(name):
    product = db.session.get(Product, name.lower())
    if product is None:
        return f"No product found with name '{name}'", 404
    product_dict = product.to_dict()
    return jsonify(product_dict)



@app.route("/api/product", methods=["POST"])
def api_create_product():
    data = request.json
    # Check all data is provided
    for key in ("name", "price", "quantity"):
        if key not in data:
            return f"The JSON provided is invalid (missing: {key})", 400
    try:
        price = round(float(data["price"]), ndigits=2)
        quantity = int(data["quantity"])
        # Make sure they are positive
        if price < 0 or quantity < 0:
            raise ValueError
    except ValueError:
        return (
            "Invalid values: price must be a positive float and quantity a positive integer",
            401,
        )

    product = Product(
        name=data["name"],
        price=price,
        quantity=quantity,
    )
    db.session.add(product)
    db.session.commit()
    return "Item added to the database"

@app.route("/api/products", methods=["GET"])
def api_get_all_products():
    products = Product.query.all()
    product_list = [product.to_dict() for product in products]
    return jsonify(product_list)


@app.route("/api/product/<string:name>", methods=["DELETE"])
def api_delete_product(name):
    product = db.session.get(Product, name.lower())
    if product is None:
        return f"No product found with name '{name}'", 404
    db.session.delete(product)
    db.session.commit()
    return f"The product '{name}' has been deleted from the database"

@app.route("/api/product/<string:name>", methods=["PUT"])
def api_update_product(name):
    product = db.session.get(Product, name.lower())
    if product is None:
        return f"No product found with name '{name}'", 404
    data = request.json

    for key in ("price", "quantity"):
        if key not in data:
            return f"The JSON provided is invalid (missing: {key})", 400
    try:
        price = round(float(data["price"]), ndigits=2)
        quantity = int(data["quantity"])
        if price < 0 or quantity < 0:
            raise ValueError
    except ValueError:
        return (
            "Invalid values: price must be a positive float and quantity a positive integer",
            401,
        )
    product.price = price
    product.quantity = quantity
    db.session.commit()
    return f"The product '{name}' has been updated in the database"

@app.route("/api/order/<int:order_id>", methods=["GET"])
def api_get_order(order_id):
    order = db.session.get(Order, order_id)
    if order is None:
        return f"No order found with ID {order_id}", 404
    order_dict = order.to_dict()
    return jsonify(order_dict)

@app.route("/api/order", methods=["POST"])
def api_create_order():
    data = request.json
    order_name = data.get("customer_name")
    order_address = data.get("customer_address")
    products = data.get("products")

    if not order_name or not order_address or not products:
        return "The JSON provided is invalid (missing: customer_name, customer_address or products)", 400

    inventory_products = Product.query.all()
    inventory_products_dict = {p.name.lower(): p for p in inventory_products}

    for p in products:
        product_name = p.get("name")
        if not product_name:
            return "The JSON provided is invalid (missing: product name)", 400
        inventory_product = inventory_products_dict.get(product_name.lower())
        if not inventory_product:
            return f"The product '{product_name}' does not exist in inventory", 400
        quantity = p.get("quantity", 1)
        if not isinstance(quantity, int):
            return f"The quantity of product '{product_name}' must be a whole integer", 400

    order = Order(name=order_name, address=order_address, completed=False)
    db.session.add(order)
    db.session.flush()

    for p in products:
        product_name = p.get("name")
        if not product_name:
            return "The JSON provided is invalid (missing: product name)", 400
        inventory_product = inventory_products_dict.get(product_name.lower())
        if not inventory_product:
            return f"The product '{product_name}' does not exist in inventory", 400
        quantity = p.get("quantity", 1)
        if not isinstance(quantity, int):
            return f"The quantity of product '{product_name}' must be a whole integer", 400
        if inventory_product is None:
            return f"The product '{product_name}' does not exist in inventory", 400

        products_order = ProductsOrder(
            product_name=product_name, order_id=order.id, quantity=quantity
        )
        db.session.add(products_order)

    db.session.commit()

    return jsonify(order.to_dict())

@app.route("/api/orders", methods=["GET"])
def api_get_all_orders():
    orders = Order.query.all()
    order_list = [order.to_dict() for order in orders]
    return jsonify(order_list)


@app.route("/api/order/<int:order_id>", methods=["PUT"])
def api_process_order(order_id):
    order = db.session.get(Order, order_id)
    if order is None:
        return f"No order found with ID '{order_id}'", 404

    try:
        data = request.json
        if not data or "process" not in data or not isinstance(data["process"], bool):
            raise ValueError
    except (ValueError, TypeError):
        return "The request must contain a JSON payload with a boolean 'process' field", 400

    if data["process"]:
        order.process()

    order_dict = order.to_dict()
    return jsonify(order_dict)

@app.route("/api/order/<int:order_id>", methods=["DELETE"])
def api_delete_order(order_id):
    order = db.session.get(Order, order_id)
    if order is None:
        return f"No order found with ID {order_id}", 404

    for product_order in order.products:
        db.session.delete(product_order)

    db.session.delete(order)
    db.session.commit()
    return f"The order with ID '{order_id}' has been deleted from the database"

@app.route("/api/order/<int:order_id>/update", methods=["PUT"])
def api_update_order(order_id):
    order = db.session.get(Order, order_id)
    if order is None:
        return f"No order found with ID '{order_id}'", 404

    data = request.json
    print(data)
    if not data or "products" not in data or not isinstance(data["products"], list):
        print(data)
        return "The request must contain a JSON payload with a list of 'products'", 400

    # Delete existing products in the order
    for product_order in order.products:
        db.session.delete(product_order)

    # Add updated products to the order
    for product_data in data["products"]:
        product_name = product_data.get("name")
        quantity = product_data.get("quantity")

        if not product_name or not isinstance(quantity, int):
            return "The JSON provided is invalid (missing: product_name or quantity)", 401

        product = db.session.get(Product, product_name.lower())
        if product is None:
            return f"The product '{product_name}' does not exist in inventory", 402

        product_order = ProductsOrder(
            product_name=product_name, order_id=order.id, quantity=quantity
        )
        db.session.add(product_order)

    db.session.commit()

    return jsonify(order.to_dict())


if __name__ == "__main__":
    app.run(debug=True)
