import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginForm.module.css';

function LoginForm(){
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isRegistering ? '/auth/register' : '/auth/login';
    const payload = isRegistering
      ? { username, email, password } : { email, password };
    

    try {
      const res = await fetch(`http://localhost:4000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      /*console.log('Login Response', data);*/

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error, something went wrong');

      console.log('Authenticated User:', data);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userId', data.id);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }

  }


  return (
      <div className={styles.wrapper}>
        <div className={styles.card_switch}>
          <label className={styles.switch}>
            <input type="checkbox" className={styles.toggle} onChange={() => setIsRegistering(!isRegistering)} />
            <span className={styles.slider} />
            <span className={styles.card_side} />
            <div className={styles.flip_card__inner}>
              <div className={styles.flip_card__front}>
                <div className={styles.title}>Log in</div>
                <div>
                  <form className={styles.flip_card__form} onSubmit={handleSubmit}>
                    <input 
                    className={styles.flip_card__input} 
                    name="email" 
                    placeholder="Email" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} 
                    />
                    <input 
                    className={styles.flip_card__input} 
                    name="password" 
                    placeholder="Password" 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} 
                    />
                    <button className={styles.flip_card__btn}>Let`s go!</button>
                  </form>
                  {error && <p className={styles.error}>{error}</p>}
                </div>
              </div>
              <div className={styles.flip_card__back}>
                <div className={styles.title}>Sign up</div>
                <div>
                  <form className={styles.flip_card__form} onSubmit={handleSubmit}>
                    <input className={styles.flip_card__input} 
                    placeholder="Username" 
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    />
                    <input 
                    className={styles.flip_card__input} 
                    name="email" 
                    placeholder="Email" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    />
                    <input 
                    className={styles.flip_card__input} 
                    name="password" 
                    placeholder="Password" 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} />
                    <button className={styles.flip_card__btn}>Confirm!</button>
                  </form>
                  {error && <p className={styles.error}>{error}</p>}
                </div>
              </div>
            </div>
          </label>
        </div>   
      </div>

  );
}


export default LoginForm;
