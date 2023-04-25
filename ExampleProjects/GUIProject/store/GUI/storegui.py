import tkinter as tk
import requests
import tkinter.ttk as ttk
from datetime import datetime


class Application(tk.Frame):
    def __init__(self, master=None):
        super().__init__(master)
        self.master = master
        self.master.title("Store Manager")
        self.grid()
        self.create_widgets()

    def create_widgets(self):
        self.notebook = Notebook(self.master)
        self.message_frame = MessageFrame(self.master)
        self.product_frame = ProductFrame(self.notebook, self.message_frame)
        self.order_frame = OrderFrame(self.notebook, self.message_frame)
        self.search_frame = SearchFrame(self.master, self.order_frame, self.product_frame, self.message_frame, self.notebook)
        self.create_order_frame = CreateOrderFrame(self.order_frame, self.message_frame)


class MessageFrame(tk.Frame):
    def __init__(self, master=None):
        super().__init__(master, bg="white", bd=2, relief="groove")
        self.grid(row=0, column=1, sticky="nsew", padx=10, pady=10)
        self.create_widgets()

    def create_widgets(self):
        tk.Label(self, text="Messages", bg="white", font=(14)).pack(pady=5)
        self.message_text = tk.Text(self, wrap="word", width=50, height=19, bg="white", font=(9))
        self.message_text.pack(padx=5, pady=5)
        self.message_text.config(state="disabled")

    def add_message(self, message):
        now = datetime.now()
        day_of_week = now.strftime("%A")
        time = now.strftime("%I:%M %p")
        self.message_text.config(state="normal")
        self.message_text.insert(tk.END, f"[{day_of_week} {time}] {message}\n")
        self.message_text.see(tk.END)
        self.message_text.config(state="disabled")


class Notebook(ttk.Notebook):
    def __init__(self, master):
        super().__init__(master)
        self.grid(row=0, column=0, sticky="nsew")


class ProductFrame(tk.Frame):
    def __init__(self, notebook, message_frame):
        super().__init__(notebook)
        notebook.add(self, text="Products")
        self.message_frame = message_frame
        self.create_widgets()
        self.load_products()

    def create_widgets(self):
        self.treeview = ttk.Treeview(self, columns=("Name", "Price", "Quantity"), show="headings", height=17)
        self.treeview.heading("Name", text="Name")
        self.treeview.heading("Price", text="Price")
        self.treeview.heading("Quantity", text="Quantity")
        self.treeview.grid(row=0, column=0, rowspan=4, columnspan=2, padx=10, pady=10)
        self.treeview.bind("<<TreeviewSelect>>", self.on_select)
        tk.Label(self, text="Name").grid(row=0, column=2, padx=10, pady=10)
        tk.Label(self, text="Price").grid(row=1, column=2, padx=10, pady=10)
        tk.Label(self, text="Quantity").grid(row=2, column=2, padx=10, pady=10)
        self.name_entry = tk.Entry(self)
        self.name_entry.grid(row=0, column=3, padx=10, pady=10)
        self.price_entry = tk.Entry(self)
        self.price_entry.grid(row=1, column=3, padx=10, pady=10)
        self.quantity_entry = tk.Entry(self)
        self.quantity_entry.grid(row=2, column=3, padx=10, pady=10)
        self.create_button = tk.Button(self, text="Create", command=self.create_product)
        self.create_button.grid(row=3, column=2, padx=10, pady=10)
        self.update_button = tk.Button(self, text="Update", command=self.update_product, state="disabled")
        self.update_button.grid(row=3, column=3, padx=10, pady=10)
        self.delete_button = tk.Button(self, text="Delete", command=self.delete_product, state="disabled")
        self.delete_button.grid(row=3, column=4, padx=10, pady=10)

    def clear_entries(self):
        self.name_entry.delete(0, tk.END)
        self.price_entry.delete(0, tk.END)
        self.quantity_entry.delete(0, tk.END)

    def load_products(self):
        self.treeview.delete(*self.treeview.get_children())
        response = requests.get("http://localhost:5000/api/products")
        if response.ok:
            products = response.json()
            for product in products:
                self.treeview.insert("", tk.END, values=(product['name'], f"${product['price']}", product['quantity']))

    def load_out_of_stock_products(self):
        self.treeview.delete(*self.treeview.get_children())
        response = requests.get("http://localhost:5000/api/products")
        if response.ok:
            products = response.json()
            for product in products:
                if product['quantity'] == 0:
                    self.treeview.insert("", tk.END, values=(product['name'], f"${product['price']}", product['quantity']))


    def create_product(self):
        name = self.name_entry.get()
        price = self.price_entry.get()
        quantity = self.quantity_entry.get()
        try:
            if float(price) < 0:
                self.message_frame.add_message(f"Error: Invalid price, price must be a number greater than zero")
            if int(quantity) < 0:
                self.message_frame.add_message(f"Error: Invalid quantity, quantity must be a number greater than zero")
        except ValueError:
            self.message_frame.add_message(f"Error: Invalid character, please input a valid number")

        payload = {
            "name": name,
            "price": price,
            "quantity": quantity
        }

        response = requests.post("http://localhost:5000/api/product", json=payload)

        if response.ok:
            self.load_products()
            self.message_frame.add_message(f"Success: {name} was added to the inventory")
            self.clear_entries()

    def update_product(self):
        name = self.name_entry.get()
        price = self.price_entry.get()
        quantity = self.quantity_entry.get()
        current_selection = self.treeview
        current_selection = self.treeview.selection()
        try:
            if float(price) < 0:
                self.message_frame.add_message(f"Error: Invalid price, price must be a number greater than zero")
            if int(quantity) < 0:
                self.message_frame.add_message(f"Error: Invalid quantity, quantity must be a number greater than zero")
        except ValueError:
            self.message_frame.add_message(f"Error: Invalid character, please input a valid number")
            
        if current_selection:
            index = current_selection[0]
            selected_product = self.treeview.item(index)
            selected_product_id = selected_product['values'][0]

            payload = {
                "name": name,
                "price": price,
                "quantity": quantity
            }

            response = requests.put(f"http://localhost:5000/api/product/{selected_product_id}", json=payload)

            if response.ok:
                self.load_products()
                self.message_frame.add_message(f"Success: {name} was updated")
                self.clear_entries()
                self.update_button["state"] = "disabled"
                self.delete_button["state"] = "disabled"

    def delete_product(self):
        current_selection = self.treeview.selection()
        if current_selection:
            index = current_selection[0]
            selected_product = self.treeview.item(index)
            name = selected_product['values'][0]

            response = requests.get("http://localhost:5000/api/orders")
            if response.ok:
                orders = response.json()
                for order in orders:
                    for list_of_products in order["products"]:
                        if name == list_of_products["name"]:
                            self.message_frame.add_message("Error: Cannot delete a product that exists in an order.")
                            return

            response = requests.delete(f"http://localhost:5000/api/product/{name}")
            if response.ok:
                self.load_products()
                self.message_frame.add_message(f"Success: {name} was deleted")
                self.clear_entries()
                self.update_button.config(state="disabled")
                self.delete_button.config(state="disabled")

    def on_select(self, event):
        selected_item = self.treeview.selection()
        if selected_item:
            product = self.treeview.item(selected_item)
            name, price, quantity = product["values"]
            self.name_entry.delete(0, tk.END)
            self.name_entry.insert(0, name)
            self.price_entry.delete(0, tk.END)
            self.price_entry.insert(0, price.replace("$", ""))
            self.quantity_entry.delete(0, tk.END)
            self.quantity_entry.insert(0, quantity)
            self.update_button.config(state="normal")
            self.delete_button.config(state="normal")
        else:
            self.clear_entries()
            self.update_button.config(state="disabled")
            self.delete_button.config(state="disabled")



class OrderFrame(tk.Frame):
    def __init__(self, notebook, message_frame):
        super().__init__(notebook)
        notebook.add(self, text="Orders")
        self.message_frame = message_frame
        self.create_widgets()
        self.load_orders()
        self.order_products = []
        self.create_order_frame = None
        self.edit_order_frame = None
        self.showing_processed_orders = False

    def create_widgets(self):
        self.order_listbox = tk.Listbox(self, width=120, height=23)
        self.order_listbox.grid(row=0, column=0, rowspan=6, columnspan=2, padx=10, pady=10)
        self.order_listbox.bind("<<ListboxSelect>>", self.on_order_select)
        self.delete_order_button = tk.Button(self, text="Delete Order", command=self.delete_order, state="disabled")
        self.delete_order_button.grid(row=2, column=2, padx=10, pady=10)
        self.process_order_button = tk.Button(self, text="Process Order", command=self.process_order, state="disabled")
        self.process_order_button.grid(row=3, column=2, padx=10, pady=10)
        self.view_order_button = tk.Button(self, text="View Order Details", command=self.view_order, state="disabled")
        self.view_order_button.grid(row=4, column=2, padx=10, pady=10)
        self.edit_order_button = tk.Button(self, text="Edit Order", command=self.edit_order, state="disabled")
        self.edit_order_button.grid(row=5, column=2, padx=10, pady=10)
        self.create_order_button = tk.Button(self, text="Create Order", command=self.create_order_frame)
        self.create_order_button.grid(row=1, column=2, padx=10, pady=10)

    def edit_order(self):
        current_selection = self.order_listbox.curselection()
        if current_selection:
            order = self.order_listbox.get(current_selection)
            order_id = order.split(" ")[1].replace("#", "")
            self.edit_order_frame = EditOrderFrame(self, order_id, self.message_frame)
            self.edit_order_frame.grid(row=0, column=4, rowspan=6, columnspan=2, sticky="nsew", padx=10, pady=10)

    def load_orders(self, search_text=None):
        self.showing_processed_orders = False
        self.order_listbox.delete(0, tk.END)
        response = requests.get("http://localhost:5000/api/orders")
        if response.ok:
            orders = response.json()
            for order in orders:
                if 'id' in order:  # Check if the order is valid
                    if search_text:
                        if search_text.capitalize() in order['customer_name'].capitalize():
                            if order['completed'] == True:
                                status = 'Processed'
                            else:
                                status = 'Not Processed'
                            self.order_listbox.insert(tk.END, f"Order #{order['id']} - Customer Name: {order['customer_name'].capitalize()} - Status: {status}")
                    else:
                        if order['completed'] == True:
                            status = 'Processed'
                        else:
                            status = 'Not Processed'
                        self.order_listbox.insert(tk.END, f"Order #{order['id']} - Customer Name: {order['customer_name'].capitalize()} - Status: {status}")
    
    def view_order(self):
        current_selection = self.order_listbox.curselection()
        if current_selection:
            order = self.order_listbox.get(current_selection)
            order_id = order.split(" ")[1].replace("#", "")
            if order.split(" ")[len(order.split(" ")) - 2] == "Not":
                status = "Not Processed"
            else:
                status = order.split(" ")[-1]
            response = requests.get(f"http://localhost:5000/api/order/{order_id}")
            if response.ok:
                order_details = response.json()
                order_details_window = tk.Toplevel(self)
                order_details_window.title(f"Order #{order_id} Details")
                order_details_text = tk.Text(order_details_window, wrap="word")
                order_details_text.pack(side="left", fill="both", expand=True)
                scrollbar = tk.Scrollbar(order_details_window)
                scrollbar.pack(side="right", fill="y")
                order_details_text.config(yscrollcommand=scrollbar.set)
                scrollbar.config(command=order_details_text.yview)
                order_details_text.insert("end", f"Order ID: {order_details['id']}\n")
                order_details_text.insert("end", f"Customer Name: {order_details['customer_name']}\n")
                order_details_text.insert("end", f"Customer Address: {order_details['customer_address']}\n")
                order_details_text.insert("end", f"Ordered On: {order_details['creation_date']}\n")
                order_details_text.insert("end", f"Status: {status}\n\n")
                order_details_text.insert("end", "Products:\n")
                for product in order_details['products']:
                    order_details_text.insert("end", f"{product['name']} - ${product['price']} - {product['quantity']}\n")
                order_details_text.insert("end", f"\nTotal Price: ${order_details['price']}\n")
                
                order_details_text.config(state="disabled")

    def fetch_pending_orders(self):
        response = requests.get('http://localhost:5000/api/orders')
        if response.ok:
            orders = response.json()
            pending_orders = [order for order in orders if not order['completed']]
            pending_orders.sort(key=lambda x: x['creation_date'])
            return pending_orders
        
    def load_pending_orders(self):
        self.showing_processed_orders = False
        self.order_listbox.delete(0, tk.END)
        pending_orders = self.fetch_pending_orders()
        for order in pending_orders:
            self.order_listbox.insert(tk.END, f"Order #{order['id']} - Customer Name: {order['customer_name'].capitalize()} - Created On: {order['creation_date']} - Status: Not Processed")

    def fetch_processed_orders(self):
        response = requests.get('http://localhost:5000/api/orders')
        if response.ok:
            orders = response.json()
            processed_orders = [order for order in orders if order['completed']]
            processed_orders.sort(key=lambda x: (x['processed_date'], x['creation_date']))
            return processed_orders

    def load_processed_orders(self):
        self.showing_processed_orders = True
        self.order_listbox.delete(0, tk.END)
        processed_orders = self.fetch_processed_orders()
        for order in processed_orders:
            self.order_listbox.insert(tk.END, f"Order #{order['id']} - Customer Name: {order['customer_name'].capitalize()} - Processed On: {order['processed_date']} - Created On: {order['creation_date']}")

    def on_order_select(self, event):
        selection = self.order_listbox.curselection()
        if selection:
            if self.showing_processed_orders:
                self.delete_order_button.config(state="disabled")
                self.process_order_button.config(state="disabled")
                self.view_order_button.config(state="normal")
                self.edit_order_button.config(state="disabled")
            else:
                order = self.order_listbox.get(selection)
                order_words = order.split(" ")

                if "Not" in order_words and order_words[-1] == "Processed":
                    self.delete_order_button.config(state="normal")
                    self.process_order_button.config(state="normal")
                    self.view_order_button.config(state="normal")
                    self.edit_order_button.config(state="normal")
                elif order_words[-1] == "Processed":
                    self.delete_order_button.config(state="disabled")
                    self.process_order_button.config(state="disabled")
                    self.view_order_button.config(state="normal")
                    self.edit_order_button.config(state="disabled")
                else:
                    self.delete_order_button.config(state="disabled")
                    self.process_order_button.config(state="disabled")
                    self.view_order_button.config(state="disabled")
                    self.edit_order_button.config(state="disabled")

    def delete_order(self):
        if self.create_order_frame is not None:
            self.create_order_frame.destroy()
            self.create_order_frame = None
        if self.edit_order_frame is not None:
            self.edit_order_frame.destroy()
            self.edit_order_frame = None

        selection = self.order_listbox.curselection()
        if selection:
            order = self.order_listbox.get(selection)
            order_id = order.split(" ")[1].replace("#", "")
            response = requests.delete(f"http://localhost:5000/api/order/{order_id}")
            if response.ok:
                self.load_orders()
                self.message_frame.add_message(f"Success: Order {order_id} deleted")
                self.delete_order_button.config(state="disabled")
                self.process_order_button.config(state="disabled")

    def process_order(self):
        selection = self.order_listbox.curselection()
        if selection:
            order = self.order_listbox.get(selection)
            order_id = order.split(" ")[1].replace("#", "")
            if order.split(" ")[len(order.split(" ")) - 2] == "Not":
                response = requests.put(f"http://localhost:5000/api/order/{order_id}", json=({"process": True}))
                if response.ok:
                    self.load_orders()
                    self.delete_order_button.config(state="disabled")
                    self.process_order_button.config(state="disabled")
                    self.message_frame.add_message(f"Success: Order {order_id} processed.")
            else:
                self.message_frame.add_message(f"Error: That order is already processed")

    def create_order_frame(self):
        if self.create_order_frame:
            return
        self.create_order_frame = CreateOrderFrame(self, self.message_frame)
        self.create_order_frame.grid(row=0, column=4, rowspan=6, columnspan=2, sticky="nsew", padx=10, pady=10)

class CreateOrderFrame(tk.Frame):
    def __init__(self, order_frame, message_frame):
        super().__init__(order_frame, bg="grey", bd=2, relief="groove")
        self.order_frame = order_frame
        self.message_frame = message_frame
        self.order_products = []
        self.create_widgets()

    def create_widgets(self):
        tk.Label(self, text="Customer Name").grid(row=0, column=0, padx=10, pady=10)
        self.name_entry = tk.Entry(self)
        self.name_entry.grid(row=0, column=1, padx=10, pady=10)
        tk.Label(self, text="Address").grid(row=1, column=0, padx=10, pady=10)
        self.address_entry = tk.Entry(self)
        self.address_entry.grid(row=1, column=1, padx=10, pady=10)
        tk.Label(self, text="Product").grid(row=2, column=0, padx=10, pady=10)
        tk.Label(self, text="Quantity").grid(row=2, column=1, padx=10, pady=10)
        self.close_button = tk.Button(self, text="Close", command=self.close_frame)
        self.close_button.grid(row=6, column=0, padx=10, pady=10)
        self.product_stock = {}
        self.cart_textbox = tk.Text(self, width=35, height=5, wrap=tk.WORD, state='disabled')
        self.cart_textbox.grid(row=5, column=0, columnspan=2, padx=10, pady=10)
        response = requests.get("http://localhost:5000/api/products")
        if response.ok:
            products = response.json()
            self.product_dropdown = ttk.Combobox(self, state="readonly")
            self.product_dropdown.grid(row=3, column=0, padx=10, pady=10)
            self.product_dropdown["values"] = [product["name"] for product in products]
            self.product_dropdown.current(0)
            for product in products:
                self.product_stock[product["name"]] = product["quantity"]
            self.quantity_entry = tk.Entry(self)
            self.quantity_entry.grid(row=3, column=1, padx=10, pady=10)
            self.add_button = tk.Button(self, text="Add", command=self.add_product)
            self.add_button.grid(row=4, column=1, padx=10, pady=10)
            self.submit_button = tk.Button(self, text="Submit", command=self.submit_order)
            self.submit_button.grid(row=6, column=1, padx=10, pady=10)

    def close_frame(self):
        self.order_frame.create_order_frame.destroy()
        self.order_frame.create_order_frame = None


    def validate_quantity(self):
        product_name = self.product_dropdown.get()
        try:
            quantity = int(self.quantity_entry.get())
        except ValueError:
            self.message_frame.add_message("Error: Please enter a valid quantity.")
            return False

        if quantity <= self.product_stock[product_name]:
            return True
        else:
            self.message_frame.add_message(f"Error: Insufficient stock for {product_name}")
            return False

    def update_cart_textbox(self):
        self.cart_textbox.config(state='normal')
        self.cart_textbox.delete(1.0, tk.END)
        for product in self.order_products:
            self.cart_textbox.insert(tk.END, f"{product['name']} x {product['quantity']}\n")
        self.cart_textbox.config(state='disabled')

    def add_product(self):
        if self.validate_quantity():
            product_name = self.product_dropdown.get()
            quantity = int(self.quantity_entry.get())
            try:
                if quantity < 0:
                    self.message_frame.add_message("Error: Please Add a Positive Quantity")
                else:
                    for product in self.order_products:
                        if product["name"] == product_name:
                            self.order_products.remove(product)
                            if (product["quantity"] + quantity) >= self.product_stock[product_name]:
                                self.message_frame.add_message(f"Warning: Adding more of this product ({product_name}) goes over the current stock, your order quantity is updated to the max stock.")
                                quantity = self.product_stock[product_name]
                            else:
                                quantity = product["quantity"] + quantity
                    self.message_frame.add_message(f"Success: Cart updated")
                    self.order_products.append({"name": product_name, "quantity": quantity})
                    self.quantity_entry.delete(0, tk.END)
                    self.update_cart_textbox()
            except ValueError:
                self.message_frame.add_message(f"Error: Please add a valid number")


    def submit_order(self):
        customer_name = self.name_entry.get()
        customer_address = self.address_entry.get()
        if ((customer_name == "") or (customer_address == "")):
            self.message_frame.add_message("Alert: Please make sure all details are inputted.") 
        else:
            payload = {"customer_name": customer_name, "customer_address": customer_address, "products": self.order_products}
            response = requests.post("http://localhost:5000/api/order", json=payload)
            if response.ok:
                self.message_frame.add_message("Success: Order submitted")
                self.order_products = []
                self.order_frame.load_orders()
                self.order_frame.create_order_frame.destroy()
                self.order_frame.create_order_frame = None
            else:
                self.message_frame.add_message("Error: Order terminated" )

class SearchFrame(tk.Frame):
    def __init__(self, master, order_frame, product_frame, message_frame, notebook):
        super().__init__(master)
        self.grid(row=1, column=0, sticky="nsew", padx=10, pady=10)
        self.create_widgets()
        self.order_frame = order_frame
        self.product_frame = product_frame
        self.message_frame = message_frame
        self.notebook = notebook


    def create_widgets(self):
        self.search_entry = tk.Entry(self)
        self.search_entry.grid(row=0, column=0, padx=10, pady=10)
        self.find_orders_button = tk.Button(self, text="Find Orders/Refresh", command=self.find_orders)
        self.find_orders_button.grid(row=0, column=1, padx=10, pady=10)
        self.view_out_of_stock_button = tk.Button(self, text="View Out of Stock Products", command=self.view_out_of_stock_products)
        self.view_out_of_stock_button.grid(row=0, column=3, padx=10, pady=10)
        self.view_pending_orders_button = tk.Button(self, text="View Pending Orders", command=self.view_pending_orders)
        self.view_pending_orders_button.grid(row=0, column=4, padx=10, pady=10)
        self.view_processed_orders_button = tk.Button(self, text="View Processed Orders", command=self.view_processed_orders)
        self.view_processed_orders_button.grid(row=0, column=5, padx=10, pady=10)
        self.view_all_products_button = tk.Button(self, text="View All Products", command=self.view_all_products)
        self.view_all_products_button.grid(row=0, column=2, padx=10, pady=10)

    def view_all_products(self):
        self.product_frame.load_products()
        self.notebook.select(self.product_frame)
        self.message_frame.add_message("Showing All Products")

    def find_orders(self):
        search_text = self.search_entry.get()
        self.order_frame.load_orders(search_text)
        self.notebook.select(self.order_frame)
        self.message_frame.add_message("Showing Search Results")

    def view_out_of_stock_products(self):
        self.product_frame.load_out_of_stock_products()
        self.notebook.select(self.product_frame)
        self.message_frame.add_message("Showing Out of Stock Products")

    def view_pending_orders(self):
        self.order_frame.load_pending_orders()
        self.notebook.select(self.order_frame)
        self.message_frame.add_message("Showing Pending Orders")

    def view_processed_orders(self):
        self.order_frame.load_processed_orders()
        self.notebook.select(self.order_frame)
        self.message_frame.add_message("Showing Processed Orders")
    
class EditOrderFrame(tk.Frame):
    def __init__(self, order_frame, order_id, message_frame):
        super().__init__(order_frame, bg="grey", bd=2, relief="groove")
        self.order_frame = order_frame
        self.order_id = order_id
        self.message_frame = message_frame
        self.order_products = []
        self.create_widgets()
        self.load_order_details()

    def create_widgets(self):
        self.title_label = tk.Label(self, text=f"Edit Order #{self.order_id}", font=12)
        self.title_label.grid(row=0, column=0, columnspan=2, padx=10, pady=10)

        self.products_label = tk.Label(self, text="Products", font=10)
        self.products_label.grid(row=1, column=0, padx=10, pady=5)

        self.products_listbox = tk.Listbox(self, width=20, height=11)
        self.products_listbox.grid(row=2, column=0, padx=10, pady=5)

        self.delete_button = tk.Button(self, text="Delete Product", command=self.delete_product)
        self.delete_button.grid(row=3, column=0, padx=10, pady=5)

        self.quantity_label = tk.Label(self, text="Quantity", font=10)
        self.quantity_label.grid(row=1, column=1, padx=10, pady=5)

        self.quantity_entry = tk.Entry(self)
        self.quantity_entry.grid(row=2, column=1, padx=10, pady=5)

        self.update_button = tk.Button(self, text="Update Quantity", command=self.update_quantity)
        self.update_button.grid(row=3, column=1, padx=10, pady=5)

        self.save_button = tk.Button(self, text="Save Changes", command=self.save_changes)
        self.save_button.grid(row=4, column=1, padx=10, pady=5)

        self.close_button = tk.Button(self, text="Close", command=self.close_frame)
        self.close_button.grid(row=4, column=0, padx=10, pady=5)
        self.product_stock = {}
        response = requests.get("http://localhost:5000/api/products")
        if response.ok:
            products = response.json()
            for product in products:
                self.product_stock[product["name"]] = product["quantity"]

    def close_frame(self):
        self.order_frame.edit_order_frame.destroy()
        self.order_frame.edit_order_frame = None

    def load_order_details(self):
        response = requests.get(f"http://localhost:5000/api/order/{self.order_id}")
        if response.ok:
            order_details = response.json()
            self.order_products = order_details.get("products", [])
            self.populate_products_listbox()

    def populate_products_listbox(self):
        self.products_listbox.delete(0, tk.END)
        for product in self.order_products:
            product_name = product["name"]
            product_quantity = product["quantity"]
            self.products_listbox.insert(tk.END, f"{product_name} ({product_quantity})")

    def delete_product(self):
        selected_index = self.products_listbox.curselection()

        if selected_index:
            product_name = self.products_listbox.get(selected_index)
            target_character = "("
            index = product_name.find(target_character)
            product_name = product_name[:index-1]
            self.products_listbox.delete(selected_index)
            self.order_products = [p for p in self.order_products if p['name'] != product_name]

    def valid_quantity(self, product_name, new_quantity):
        available_stock = self.product_stock.get(product_name, 0)
        if new_quantity <= available_stock:
            return True
        return False

    def update_quantity(self):
        new_quantity = int(self.quantity_entry.get())
        selected_index = self.products_listbox.curselection()

        if new_quantity < 0:
            self.message_frame.add_message("Error: Please Add a Positive Quantity")
        else:
            if selected_index:
                product_name = self.products_listbox.get(selected_index)
                target_character = "("
                index = product_name.find(target_character)
                product_name = product_name[:index-1]
                if self.valid_quantity(product_name, new_quantity):
                    for product in self.order_products:
                        if product["name"] == product_name:
                            product["quantity"] = new_quantity
                            break
                    self.populate_products_listbox()
                else:
                    available_stock = self.product_stock.get(product_name, 0)
                    self.message_frame.add_message(f"Error: The quantity you are trying to set exceeds the available stock of {product_name}. Maximum available stock: {available_stock}")


    def save_changes(self):
        updated_order_data = {
            "order_id": self.order_id,
            "products": self.order_products
        }
        response = requests.put(f"http://localhost:5000/api/order/{self.order_id}/update", json=updated_order_data)
        if response.ok:
            self.message_frame.add_message("Success: Order updated successfully.")
            self.order_frame.load_orders()
        else:
            self.message_frame.add_message("Error: Order was not updated successfully.")

if __name__ == "__main__":
    root = tk.Tk()
    app = Application(master=root)
    app.mainloop()