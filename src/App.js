import React, { Suspense } from 'react';
import Login from './pages/Login';
import './style/App.scss';
import './style/Login.scss';
const Index = React.lazy(() => import('./pages/Index'));

class App extends React.Component {

    state = {
        username: false,
        hash: null,
        loggedIn: false
    }

    componentDidMount() {
        const [ hash, username ] = document.cookie.split(';').reduce((hasLoginCookie, cookie) => cookie.includes('loggedIn') ? cookie.split('loggedIn=').pop().split('&') : hasLoginCookie, [ false, false ]);
        if (!this.state.loggedIn && hash) this.setState({ hash: JSON.parse(hash), username, loggedIn: true });
    }

    handleLogin = ({ username, loggedIn, hash, error }) => {
        const date = new Date();
        date.setTime(`${date.getTime()}${(30 * 24 * 60 * 60 * 1000)}`); // set expiry to 30 days from now.
        
        const expiryDate = `; expiryDate=" ${date.toUTCString()}`;
        
        document.cookie = `loggedIn=${JSON.stringify(hash) || ''}&${username}${expiryDate}; path=/`;

        this.setState({ username, hash, loggedIn, error });
    };

    handleLogOut = () => { 
        document.cookie = 'loggedIn=;Max-Age=-99999999';
        this.setState({ username: false, hash: null, loggedIn: false });
    }

    render() {

        if (!this.state.loggedIn) {
            return <Login handleLogin={this.handleLogin} error={this.state.error} />;
        }
 
        return <Suspense fallback={<div className='App'>Loading...</div>}>
            <Index 
                handleLogOut={this.handleLogOut}
                username={this.state.username}
                hash={this.state.hash}
            />;
        </Suspense>
    }
}

export default App;
