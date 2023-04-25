from database import db
from datetime import datetime

class Product(db.Model):
    name = db.Column(db.String, primary_key=True)
    price = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)

    def to_dict(self):
        return {
            "name": self.name,
            "price": self.price,
            "quantity": self.quantity,
        }

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    address = db.Column(db.String, nullable=False)
    completed = db.Column(db.Boolean, default=False)
    products = db.relationship('ProductsOrder', back_populates='order')
    creation_date = db.Column(db.DateTime, nullable=False, default=datetime.now)
    processed_date = db.Column(db.DateTime, nullable=False, default=datetime.now)

    def to_dict(self):
        products_list = []
        total_price = 0
        for product_order in self.products:
            product = product_order.product
            if product is None:
                print(f"The product {product_order.product_name} does not exist")
                # return f"The product '{product_order.product_name}' does not exist"
            price = product.price * product_order.quantity
            products_list.append({
                "name": product.name,
                "quantity": product_order.quantity,
                "price": round(price, ndigits=2)
            })
            total_price += price

        formatted_creation_date = self.creation_date.strftime("%B %d, %Y %I:%M %p")
        formatted_processed_date = self.processed_date.strftime("%B %d, %Y %I:%M %p")
        return {
            "id": self.id,
            "customer_name": self.name,
            "customer_address": self.address,
            "products": products_list,
            "price": round(total_price, ndigits=2),
            "completed": self.completed,
            "creation_date": formatted_creation_date,
            "processed_date": formatted_processed_date
        }


    def process(self):
        if self.completed:
            return
        for product_order in self.products:
            product = product_order.product
            if product.quantity < product_order.quantity:
                product_order.quantity = product.quantity
        for product_order in self.products:
            product = product_order.product
            product.quantity -= product_order.quantity
            db.session.add(product)
        self.completed = True
        self.processed_date = datetime.now()
        db.session.add(self)
        db.session.commit()
    
class ProductsOrder(db.Model):
    product_name = db.Column(db.ForeignKey('product.name'), primary_key=True)
    order_id = db.Column(db.ForeignKey('order.id'), primary_key=True)
    quantity = db.Column(db.Integer, nullable=False)
    product = db.relationship('Product')
    order = db.relationship('Order', back_populates='products')


