import React from 'react';

class Login extends React.Component {

    state = {
        loggedIn: false,
        registered: false
    };


    handleChange = ({ target: { name, value }  }) => {
        this.setState({ [name]: value });
    };

    handleSubmit = (e, type) => {
        e.preventDefault();

        fetch(`${process.env.REACT_APP_API_URL}:${process.env.REACT_APP_API_PORT}/api/auth/${type}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: this.state.username, password: this.state.password }),
        })
        .then((res) => res.json())
        .then(data => {

            if (data.registration) {
                this.setState({ registered: true });
            } else {
                this.props.handleLogin(data);
            }

        })
        .catch(err => console.log(type === 'login' ? 'Error while logging in:' : 'Error while registering:', err));
    };

    render () {

        return <div className="login-form">
			<h1>Login/Register</h1>
            <p className='error'>{this.props.error}</p>
            {this.state.registered && <p className='registered'>Registration successful! Please login with your new credentials</p>}
			<form onSubmit={(e) => e.preventDefault()}>
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    onChange={this.handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    onChange={this.handleChange}
                    required
                />
				<input onClick={e => this.handleSubmit(e, 'login')} type="submit" value="Login" />
                <input onClick={e => this.handleSubmit(e, 'register')} type="submit" value="Register" />
			</form>

		</div>;
    }

}

export default Login;
