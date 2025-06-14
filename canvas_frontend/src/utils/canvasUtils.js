// Utility functions for canvas operations

export function drawElements(ctx, elements) {
  elements.forEach(el => {
    switch (el.type) {
      case 'rectangle':
        ctx.fillStyle = el.color || '#000';
        ctx.fillRect(el.x, el.y, el.width, el.height);
        break;
      case 'circle':
        ctx.beginPath();
        ctx.arc(el.x, el.y, el.radius, 0, 2 * Math.PI);
        ctx.fillStyle = el.color || '#000';
        ctx.fill();
        break;
      case 'text':
        ctx.font = `${el.fontSize || 16}px Arial`;
        ctx.fillStyle = el.color || '#000';
        ctx.fillText(el.text, el.x, el.y);
        break;
      case 'image':
        const img = new window.Image();
        img.src = el.src;
        if (img.complete) {
          ctx.drawImage(img, el.x, el.y, el.width, el.height);
        } else {
          img.onload = () => {
            ctx.drawImage(img, el.x, el.y, el.width, el.height);
          };
        }
        break;
      case 'pencil':
        if (el.points && el.points.length > 1) {
          ctx.strokeStyle = el.color || '#222';
          ctx.lineWidth = el.lineWidth || 2;
          ctx.beginPath();
          ctx.moveTo(el.points[0].x, el.points[0].y);
          for (let i = 1; i < el.points.length; i++) {
            ctx.lineTo(el.points[i].x, el.points[i].y);
          }
          ctx.stroke();
        }
        break;
      default:
        break;
    }
  });
} 