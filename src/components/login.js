import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import '../componentCss/login.css';
import '@fortawesome/fontawesome-free/css/all.min.css';


const Login = () => {
    const demoEmail = "test@gmail.com";
    const demoPassword = "testing";

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false); // State to toggle password visibility

    const navigate = useNavigate(); // Create navigate instance

    const handleSubmit = (e) => {
        e.preventDefault();

        // Check if entered email and password match demo credentials
        if (email === demoEmail && password === demoPassword) {
            alert("Login successful!");
            setErrorMessage(''); // Clear error message
            navigate('/home');  // Navigate to the home page after successful login
        } else {
            setErrorMessage("Invalid email or password. Try using 'demo@example.com' and 'password123'");
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Login</h2>
                <p className="terms-text">
                    By signing in you are agreeing to our <a href="#">Terms and privacy policy</a>
                </p>
                <div className="form-toggle">
                    <button className="toggle-btn active">Login</button>
                    <button className="toggle-btn" onClick={() => navigate('/register')}>Register</button>
                </div>
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type={passwordVisible ? 'text' : 'password'}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <i 
                            className={`password-icon ${passwordVisible ? 'visible' : ''}`} 
                            onClick={() => setPasswordVisible(!passwordVisible)}
                        >
                            {passwordVisible ? '🙈' : '👁️'}
                        </i>
                    </div>
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                    <div className="extra-options">
                        <label>
                            <input type="checkbox" />
                            Remember password
                        </label>
                        <a href="#" className="forgot-password">Forget password</a>
                    </div>
                    <button type="submit" className="login-btn">Login</button>
                </form>
                <div className="social-login">
                    <p>or connect with</p>
                    <div className="social-icons">
                        <a href="#"><i className="fab fa-facebook"></i></a>
                        <a href="#"><i className="fab fa-instagram"></i></a>
                        <a href="#"><i className="fab fa-pinterest"></i></a>
                        <a href="#"><i className="fab fa-linkedin"></i></a>
                    </div>
                </div>
                <div className="fingerprint">
                    <img src="https://img.icons8.com/ios-filled/50/000000/fingerprint.png" alt="fingerprint" />
                </div>
            </div>
            <div className='footer'>
                <p><b>For login use :</b> test@gmail.com </p>
                <p><b>For password use :</b> testing </p>
                <p><b>For register use :</b> 1234567890 </p>
                <p><b>For OTP use :</b> 98765 </p>
                <p>&copy; 2024 All rights reserved</p>
            </div>
        </div>
    );
};

export default Login;
