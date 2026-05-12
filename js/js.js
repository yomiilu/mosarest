document.addEventListener("DOMContentLoaded", function(){
    const whiteBlock = document.querySelector('.white');
    const section1 = document.querySelector('.section1');
    const animatedWord = document.querySelector('.animated-word');

    function handleScroll() {
        const scrollY = window.scrollY;
        const sectionHeight = section1.offsetHeight;
        const maxScroll = sectionHeight - window.innerHeight;
        
        let whiteProgress = scrollY / maxScroll;
        whiteProgress = Math.min(0.85, Math.max(0, whiteProgress));
        if (whiteBlock) whiteBlock.style.opacity = whiteProgress;
        
        let textProgress = scrollY / maxScroll;
        textProgress = Math.min(1, Math.max(0, textProgress));
        
        const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
        const smoothProgress = easeOutCubic(textProgress);
        
        let scale = 0.3 + (smoothProgress * 2.2);
        if (animatedWord) animatedWord.style.transform = `translate(-50%, -50%) scale(${scale})`;
        
        if (whiteProgress > 0.01 && animatedWord && document.querySelector('.video-wrapper')) {
            const rect = animatedWord.getBoundingClientRect();
            const wrapperRect = document.querySelector('.video-wrapper').getBoundingClientRect();
            
            const x = (rect.left + rect.width/2 - wrapperRect.left) / wrapperRect.width * 100;
            const y = (rect.top + rect.height/2 - wrapperRect.top) / wrapperRect.height * 100;
            const fontSize = 120 * scale;
            
            whiteBlock.style.webkitMaskImage = `radial-gradient(circle at ${x}% ${y}%, transparent 0%, transparent ${fontSize/2}px, white ${fontSize/2}px, white 100%)`;
            whiteBlock.style.maskImage = `radial-gradient(circle at ${x}% ${y}%, transparent 0%, transparent ${fontSize/2}px, white ${fontSize/2}px, white 100%)`;
        } else if (whiteBlock) {
            whiteBlock.style.webkitMaskImage = 'none';
            whiteBlock.style.maskImage = 'none';
        }
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    });
    
    handleScroll();

    // === ИСПРАВЛЕННЫЙ КОД ПРОГРЕСС-БАРА ===
    const progress_bar = document.querySelector('.progress');

    function upd_progress() {
        if (!progress_bar) return; 
        
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / scrollHeight) * 100;
        
        progress_bar.style.width = scrollPercent + '%';
    }
    
    window.addEventListener('load', () => {
        if (progress_bar) {
            progress_bar.style.width = '0%';
            upd_progress();
        }
    });
    
    window.addEventListener('scroll', upd_progress);
    upd_progress();
});