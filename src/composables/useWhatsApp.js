export function useWhatsApp() {
  // Función para abrir WhatsApp con mensaje predefinido
  const abrirWhatsApp = (telefono, mensaje) => {
    // Limpiar el número de teléfono (quitar espacios y caracteres especiales)
    const numeroLimpio = telefono.replace(/[^\d]/g, '')

    // Codificar el mensaje para URL
    const mensajeCodificado = encodeURIComponent(mensaje)

    // Crear la URL de WhatsApp
    const urlWhatsApp = `https://wa.me/${numeroLimpio}?text=${mensajeCodificado}`

    // Abrir en nueva ventana
    window.open(urlWhatsApp, '_blank')
  }

  // Mensaje para confirmación de compra
  const enviarConfirmacionCompra = (telefono, numeroCompra, total) => {
    const mensaje =
      `🛒 *Confirmación de Compra - Minutos de Vida*\n\n` +
      `Hola! Tu compra #${numeroCompra} ha sido evaluada y aprobada.\n\n` +
      `💰 *Total:* $${total}\n\n` +
      `*Medios de pago disponibles:*\n` +
      `💳 Transferencia bancaria\n` +
      `💵 Efectivo (contra entrega)\n` +
      `🏧 Depósito bancario\n\n` +
      `Por favor, confirma el medio de pago de tu preferencia para proceder con el envío.\n\n` +
      `¡Gracias por confiar en nosotros! 🙌`

    abrirWhatsApp(telefono, mensaje)
  }

  // Mensaje para seguimiento de compra del cliente
  const enviarSeguimientoCliente = (telefono, numeroCompra) => {
    const mensaje =
      `🛒 *Seguimiento de Compra - Minutos de Vida*\n\n` +
      `Hola! Quiero hacer seguimiento a mi compra #${numeroCompra}.\n\n` +
      `¿Podrían proporcionarme información sobre el estado de mi pedido?\n\n` +
      `Gracias! 😊`

    abrirWhatsApp(telefono, mensaje)
  }

  // Mensaje genérico de contacto
  const enviarMensajeGenerico = (telefono, asunto = '') => {
    const mensaje = `Hola! Me comunico desde la app *Minutos de Vida* ${asunto ? `sobre: ${asunto}` : ''}\n\n`

    abrirWhatsApp(telefono, mensaje)
  }

  return {
    abrirWhatsApp,
    enviarConfirmacionCompra,
    enviarSeguimientoCliente,
    enviarMensajeGenerico,
  }
}
