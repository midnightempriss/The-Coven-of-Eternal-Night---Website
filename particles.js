class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particleCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null };
        this.trail = [];
        this.maxTrailLength = 20;
        
        this.resize();
        this.init();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            
            // Add to trail
            this.trail.push({ x: e.clientX, y: e.clientY });
            if (this.trail.length > this.maxTrailLength) {
                this.trail.shift();
            }
            
            // Create particles at cursor
            for (let i = 0; i < 3; i++) {
                this.particles.push(new Particle(this.canvas, this.ctx, e.clientX, e.clientY, true));
            }
        });
        
        window.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
            this.trail = [];
        });
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    init() {
        for (let i = 0; i < 100; i++) {
            this.particles.push(new Particle(this.canvas, this.ctx));
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw cursor trail
        if (this.trail.length > 1) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.trail[0].x, this.trail[0].y);
            
            for (let i = 1; i < this.trail.length; i++) {
                const opacity = i / this.trail.length * 0.3;
                this.ctx.strokeStyle = `rgba(199, 125, 255, ${opacity})`;
                this.ctx.lineWidth = (i / this.trail.length) * 3;
                this.ctx.lineTo(this.trail[i].x, this.trail[i].y);
                this.ctx.stroke();
                this.ctx.beginPath();
                this.ctx.moveTo(this.trail[i].x, this.trail[i].y);
            }
        }
        
        // Portal effect at center
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Portal glow
        const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 200);
        gradient.addColorStop(0, 'rgba(199, 125, 255, 0.1)');
        gradient.addColorStop(0.5, 'rgba(127, 57, 251, 0.05)');
        gradient.addColorStop(1, 'transparent');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw particles
        this.particles = this.particles.filter(particle => {
            particle.update(this.mouse);
            particle.draw();
            return particle.life > 0;
        });
        
        // Limit particles
        if (this.particles.length > 300) {
            this.particles = this.particles.slice(-300);
        }
        
        requestAnimationFrame(() => this.animate());
    }
}

class Particle {
    constructor(canvas, ctx, mouseX = null, mouseY = null, isMouseParticle = false) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.isMouseParticle = isMouseParticle;
        
        if (isMouseParticle && mouseX && mouseY) {
            // Particles from cursor
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 3 + 1;
            
            this.x = mouseX;
            this.y = mouseY;
            this.speedX = Math.cos(angle) * velocity;
            this.speedY = Math.sin(angle) * velocity;
            this.size = Math.random() * 4 + 2;
            this.life = 1;
            this.decay = Math.random() * 0.02 + 0.01;
            this.color = `hsl(${260 + Math.random() * 40}, 90%, ${60 + Math.random() * 20}%)`;
        } else {
            this.reset();
        }
    }
    
    reset() {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 150;
        
        this.x = this.canvas.width / 2 + Math.cos(angle) * radius;
        this.y = this.canvas.height / 2 + Math.sin(angle) * radius;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 2;
        this.speedY = (Math.random() - 0.5) * 2;
        this.life = 1;
        this.decay = Math.random() * 0.01 + 0.005;
        this.color = `hsl(${270 + Math.random() * 30}, 80%, ${50 + Math.random() * 20}%)`;
    }
    
    update(mouse) {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
        
        if (!this.isMouseParticle) {
            // Gravitational pull to center
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            const dx = centerX - this.x;
            const dy = centerY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 50) {
                this.speedX += dx / distance * 0.05;
                this.speedY += dy / distance * 0.05;
            }
            
            // Mouse interaction
            if (mouse.x && mouse.y) {
                const mouseDx = mouse.x - this.x;
                const mouseDy = mouse.y - this.y;
                const mouseDistance = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);
                
                if (mouseDistance < 100) {
                    this.speedX -= mouseDx / mouseDistance * 0.5;
                    this.speedY -= mouseDy / mouseDistance * 0.5;
                }
            }
        } else {
            // Cursor particles behavior
            this.speedY += 0.1; // Gravity
            this.speedX *= 0.98; // Friction
            this.size *= 0.98; // Shrink
        }
    }
    
    draw() {
        this.ctx.save();
        this.ctx.globalAlpha = this.life;
        this.ctx.fillStyle = this.color;
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = this.color;
        
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
}

// Initialize particle system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ParticleSystem();
});
