// Función para cargar el menú desde el archivo JSON
async function loadMenuData() {
    try {
        const response = await fetch("./menu.json");
        const menuJson = await response.json();
        menuData = menuJson;
    } catch (error) {
        console.error("Error al cargar el menú:", error);
    }
}

// Variables globales
let userInputNumber = 0;
let cartItems = [];

// Evento de carga del DOM
document.addEventListener("DOMContentLoaded", async () => {
    await loadMenuData(); // Cargar el menú antes de generar las tarjetas de productos

    // Seleccionar elementos del carrito
    const cartIcon = document.querySelector(".cart");
    const cartModal = document.querySelector(".cart-modal");
    const notification = document.querySelector(".notification");

    // Mostrar/ocultar el modal del carrito
    function toggleCartModal() {
        if (cartModal.style.display === "none") {
            cartModal.style.display = "block";
        } else {
            cartModal.style.display = "none";
        }
    }

    // Evento para mostrar/ocultar el modal al hacer clic en el icono del carrito
    document.addEventListener("click", (event) => {
        if (cartIcon.contains(event.target)) {
            if (cartModal.style.display === "none") {
                toggleCartModal();
            } else if (!event.target.classList.contains("cart-modal__delete")) {
                cartModal.style.display = "none";
            }
        }
    });

    // Generar las tarjetas de productos
    menuData.menu.forEach(createProductCard);
    updateNotification();
});

// Función para generar los elementos de la tarjeta para cada producto
function createProductCard(product) {
    const cardContainer = document.getElementById("menuContainer");

    const card = document.createElement("div");
    card.className = "card-product";

    const imgContainer = document.createElement("div");
    imgContainer.className = "container-img";

    const img = document.createElement("img");
    img.src = product.imagen;
    img.alt = product.nombre;

    const buttonGroup = document.createElement("div");
    buttonGroup.className = "button-group";
    buttonGroup.innerHTML = `
    <span title="Agregar al carrito" onclick="addToCart(${product.id})">
        <i class="fa-solid fa-shopping-cart details__button"></i>
    </span>
    `;

    imgContainer.appendChild(img);
    imgContainer.appendChild(buttonGroup);

    const contentContainer = document.createElement("div");
    contentContainer.className = "content-card-product";

    const title = document.createElement("h3");
    title.textContent = product.nombre;

    const description = document.createElement("p");
    description.textContent = product.descripcion;

    const priceAndQuantityContainer = document.createElement("div");
    priceAndQuantityContainer.style.display = "flex";
    priceAndQuantityContainer.style.alignItems = "center";
    priceAndQuantityContainer.style.gap = "3rem";

    const price = document.createElement("p");
    price.className = "price";
    price.textContent = `$${product.precio.toFixed(2)}`;

    const quantityInput = document.createElement("div");
    quantityInput.className = "inputquantity";
    quantityInput.innerHTML = `
    <i class="fa-solid fa-minus quantity-icon" onclick="decreaseQuantity(this)"></i>
    <input class="input__number" type="text" value="0">
    <i class="fa-solid fa-plus quantity-icon" onclick="increaseQuantity(this)"></i>
  `;
    priceAndQuantityContainer.appendChild(quantityInput);
    priceAndQuantityContainer.appendChild(price);

    contentContainer.appendChild(title);
    contentContainer.appendChild(description);
    contentContainer.appendChild(priceAndQuantityContainer);

    card.appendChild(imgContainer);
    card.appendChild(contentContainer);

    cardContainer.appendChild(card);
}

// Funciones para manejar la cantidad de productos en el carrito
function increaseQuantity(element) {
    const input = element.parentElement.querySelector(".input__number");
    const productId = parseInt(input.dataset.productId);

    userInputNumber++;
    input.value = userInputNumber;

    if (cartItems.some((item) => item.id === productId)) {
        userInputNumber = 0;
    }
    updateNotification();
}

function decreaseQuantity(element) {
    const input = element.parentElement.querySelector(".input__number");
    const productId = parseInt(input.dataset.productId);

    userInputNumber = Math.max(1, userInputNumber - 1);
    input.value = userInputNumber;

    if (cartItems.some((item) => item.id === productId)) {
        userInputNumber = 0;
    }
    updateNotification();
}

// Actualizar la notificación del carrito
function updateNotification() {
    let totalQuantity = 0;

    for (const item of cartItems) {
        totalQuantity += item.cantidad;
    }

    const notification = document.querySelector(".notification");
    notification.textContent = totalQuantity;
    notification.style.display = "block";
}
// Agregar un producto al carrito
function addToCart(productId) {
    const selectedProduct = menuData.menu.find(
        (product) => product.id === productId
    );
    const quantity = userInputNumber;

    if (quantity > 0) {
        const existingProductIndex = cartItems.findIndex(
            (item) => item.id === productId
        );

        if (existingProductIndex !== -1) {
            cartItems[existingProductIndex].cantidad += quantity;
        } else {
            const productDetails = {
                id: selectedProduct.id,
                nombre: selectedProduct.nombre,
                imagen: selectedProduct.imagen,
                precio: selectedProduct.precio,
                cantidad: quantity,
            };
            cartItems.push(productDetails);
        }
        userInputNumber = 0;

        updateCartModal();
        updateNotification();
    }
}
// Actualizar el contenido del modal del carrito
function updateCartModal() {
    const productContainer = document.querySelector(
        ".cart-modal__details-container"
    );
    const totalAmountSpan = document.getElementById("totalAmount");
    const subtotalContainer = document.getElementById("subtotalContainer");
    const emptyCartMessage = document.getElementById("emptyCartMessage");
    const clearCartButton = document.querySelector(".cart-modal__clear");
    const checkoutButton = document.querySelector(".cart-modal__checkout");

    let totalAmount = 0;

    productContainer.innerHTML = "";

    // Carrito vacío, mostrar mensaje y ocultar botones
    if (cartItems.length === 0) {
        emptyCartMessage.style.display = "block";
        clearCartButton.style.display = "none";
        checkoutButton.style.display = "none";
    } else {
        emptyCartMessage.style.display = "none";
        clearCartButton.style.display = "block";
        checkoutButton.style.display = "block";
    }

    cartItems.forEach((item) => {
        const productDetails = document.createElement("div");
        productDetails.className = "cart-modal__product-details";
        productDetails.innerHTML = `
        <img class="cart-modal__image" src="${item.imagen}" alt="">
        <div>
            <p class="cart-modal__product">${item.nombre}</p>
            <p class="cart-modal__price">${
                item.cantidad
            }u x $${item.precio.toFixed(2)} = $${(
            item.cantidad * item.precio
        ).toFixed(2)}</p>
        </div>
        <span class="cart-modal__delete" onclick="deleteProduct(${item.id})">
            <i class="fa-solid fa-trash"></i>
        </span>
    `;
        productContainer.appendChild(productDetails);

        totalAmount += item.cantidad * item.precio;
    });

    // Actualizar el total
    totalAmountSpan.textContent = `$${totalAmount.toFixed(2)}`;

    // Mostrar o ocultar el contenedor del subtotal
    subtotalContainer.style.display = cartItems.length > 0 ? "flex" : "none";

    // Mostrar o ocultar los botones
    clearCartButton.style.display = cartItems.length > 0 ? "block" : "none";
    checkoutButton.style.display = cartItems.length > 0 ? "block" : "none";
}

// Eliminar un producto del carrito
function deleteProduct(productId) {
    const productIndex = cartItems.findIndex((item) => item.id === productId);
    if (productIndex !== -1) {
        cartItems.splice(productIndex, 1);
        updateCartModal();
        updateNotification();
        const cartModal = document.querySelector(".cart-modal");
    }
}
// Vaciar el carrito
function clearCart() {
    cartItems = [];
    userInputNumber = 0;
    updateCartModal();
    updateNotification();
}

// Evento para el botón "Comprar"
document
    .querySelector(".cart-modal__checkout")
    .addEventListener("click", () => {
        openModal();
    });

// Función para abrir el modal
function openModal() {
    const modal = document.getElementById("modal");
    modal.style.display = "block";
}

// Función para cerrar el modal
function closeModal() {
    const modal = document.getElementById("modal");
    modal.style.display = "none";
}
function showOrderConfirmation(pedido) {
    const confirmationContainer = document.createElement("div");
    confirmationContainer.className = "order-confirmation";

    const confirmationMessage = `
    <span>¡Pedido realizado con éxito!</span> <br>
    <br>
    <b>Número de pedido:</b> ${pedido.numeroPedido}<br>
    <br>
    <b>Detalles del pedido:</b>
        ${pedido.detalles
            .map(
                (item) =>
                    `- ${item.nombre} x ${item.cantidad}u = $${item.subtotal}`
            )
            .join("<br>")}<br>
    Costo total: $${pedido.costoTotal}<br>
    <br>
    <b>Información del usuario:</b>
    Nombre: ${pedido.usuario.nombre}<br>
    Dirección: ${pedido.usuario.direccion}, ${pedido.usuario.provincia}<br>
    Teléfono: ${pedido.usuario.telefono}<br>
    Correo electrónico: ${pedido.usuario.correo}
    `;

    const closeButton = document.createElement("button");
    closeButton.textContent = "Cerrar";
    closeButton.className = "close confirmclose";
    closeButton.addEventListener("click", () => {
        confirmationContainer.remove();
    });

    confirmationContainer.innerHTML = confirmationMessage;
    confirmationContainer.appendChild(closeButton);

    // Agregar el contenedor al cuerpo del documento
    document.body.appendChild(confirmationContainer);
    clearCart();
}
// Función para generar un número de pedido aleatorio 
function generateOrderNumber() {
    return Math.floor(Math.random() * 1000000) + 1;
}

// Función para obtener el monto total del carrito
function getTotalAmount() {
    let total = 0;
    for (const item of cartItems) {
        total += item.cantidad * item.precio;
    }
    return total.toFixed(2);
}
// Función para validar y enviar el formulario
function submitOrder() {
    const nombreUsuario = document.getElementById("nombreUsuario").value;
    const direccionEntrega = document.getElementById("direccionEntrega").value;
    const provinciaEntrega = document.getElementById("provinciaEntrega").value;
    const numeroTelefono = document.getElementById("numeroTelefono").value;
    const correoElectronico = document.getElementById("correoElectronico").value;

    // Validar la información ingresada
    if (
        nombreUsuario && direccionEntrega && numeroTelefono && correoElectronico) {
        const pedido = {
            numeroPedido: generateOrderNumber(),
            usuario: {
                nombre: nombreUsuario,
                direccion: direccionEntrega,
                provincia: provinciaEntrega,
                telefono: numeroTelefono,
                correo: correoElectronico,
            },

            detalles: cartItems.map((item) => ({
                nombre: item.nombre,
                cantidad: item.cantidad,
                subtotal: item.cantidad * item.precio,
            })),
            costoTotal: getTotalAmount(),
        };

        // Mostrar la confirmación del pedido
        showOrderConfirmation(pedido);

        // Cerrar el modal después de enviar el pedido
        closeModal();

        // Limpiar el carrito después de realizar el pedido
        clearCart();
    } else {
        // Crear el div de confirmación
        const confirmationContainer = document.createElement("div");
        confirmationContainer.className = "order-confirmation";

        // Agregar el contenedor al cuerpo del documento
        document.body.appendChild(confirmationContainer);

        // Mostrar el mensaje de error
        alert(
            "Por favor, complete todos los campos antes de realizar el pedido."
        );

    }
}
// Evento para el botón "Realizar Pedido"
document.getElementById("submitOrder").addEventListener("click", () => {
    submitOrder();
});
