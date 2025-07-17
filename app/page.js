'use client';

import { useEffect, useState, useRef } from 'react';
import styles from './page.module.css';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('./Map'), { ssr: false });

function MatrixBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const letters = 'アァイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    const fontSize = 16;
    const columns = Math.floor(width / fontSize);
    const drops = new Array(columns).fill(1);

    function draw() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#0F0'; // bright green
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    }

    let animationFrameId;
    function loop() {
      draw();
      animationFrameId = requestAnimationFrame(loop);
    }
    loop();

    function handleResize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.matrixCanvas} />;
}

export default function Home() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8443/dev0/geo/v1/location')
      .then((res) => res.json())
      .then((data) => {
        setLocation(data.resData);
        setLoading(false);
        if (data.resData?.timeZone?.name) {
          updateTime(data.resData.timeZone.name);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!location?.timeZone?.name) return;

    const interval = setInterval(() => {
      updateTime(location.timeZone.name);
    }, 1000);

    return () => clearInterval(interval);
  }, [location]);

  function updateTime(timeZone) {
    const time = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone,
    }).format(new Date());
    setCurrentTime(time);
  }

  return (
    <>
      <MatrixBackground />
      <div className={styles.container}>
        <h1 className={styles.title}>
          💀 𝙔𝙊𝙐 𝘼𝙍𝙀 <span className={styles.blink}>𝙃𝘼𝘾𝙆𝙀𝘿</span> 💀
        </h1>

        {loading ? (
          <p className={styles.loading}>⏳ Loading location data...</p>
        ) : location ? (
          <div className={styles.card}>
            <div className={styles.info}>
              <img src={location.countryFlag} alt="Flag" className={styles.flag} />
              <h2>{location.countryName}</h2>
              <p className={styles.detail}>
                <span>📡 IP:</span> {location.ip}
              </p>
              <p className={styles.detail}>
                <span>🏙️ City:</span> {location.city}
              </p>
              <p className={styles.detail}>
                <span>🌍 State:</span> {location.stateProv}
              </p>
              <p className={styles.detail}>
                <span>⏰ Timezone:</span> {location.timeZone.name} ({currentTime || '...'})
              </p>
              <p className={styles.detail}>
                <span>🛰️ ISP:</span> {location.isp}
              </p>
              <p className={styles.detail}>
                <span>💱 Currency:</span> {location.currency.name} ({location.currency.symbol})
              </p>
            </div>
            <div className={styles.map}>
              <Map lat={location.latitude} lon={location.longitude} />
            </div>
          </div>
        ) : (
          <p className={styles.error}>⚠️ Failed to load location.</p>
        )}
      </div>
    </>
  );
}
