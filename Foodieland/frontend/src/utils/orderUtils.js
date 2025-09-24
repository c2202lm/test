
/**
 * @param {object} order The order object.
 * @returns {number} The total amount including shipping, after discount.
 */
export const getOrderPayableTotal = (order) => {
    if (!order) return 0;

    if (order.items && Array.isArray(order.items)) {
        const totalAfterDiscount = Number(order.total || 0);
        const shipping = Number(order.shippingFee || 0);
        return totalAfterDiscount + shipping;
    }

    const subtotal = Number(order.price || 0) * Number(order.quantity || 1);
    const shipping = Number(order.shippingFee || 0);
    return subtotal + shipping;
};