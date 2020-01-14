import React from 'react';

class Login extends React.Component {

    state = {
        loggedIn: false,
        error: false
    };


    handleChange = ({ target: { name, value }  }) => {
        this.setState({ [name]: value });
    };

    handleSubmit = e => {
        e.preventDefault();

        fetch(`${process.env.REACT_APP_API_URL}:${process.env.REACT_APP_API_PORT}/api/auth`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: this.state.username, password: this.state.password }),
        })
        .then(res => {
            this.setState({ loggedIn: res.data.loggedIn, error: res.data.error });
            this.props.handleLogin(res.data);
        })
        .catch(err => console.log('Error while logging in:', err));
    };

    render () {

        return <div className="login-form">
			<h1>Login Form</h1>
            <p>{this.state.loggedIn || this.state.error}</p>

			<form onSubmit={this.handleSubmit}>
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
				<input type="submit" />
			</form>
		</div>;
    }

}

export default Login;
