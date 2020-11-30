import React, { Suspense } from 'react';
import Login from './pages/Login';
import './style/App.scss';
import './style/Login.scss';
const Index = React.lazy(() => import('./pages/Index'));

class App extends React.Component {

    state = {
        username: false,
        loggedIn: false
    }

    componentDidMount() {
        const username = document.cookie.split(';').reduce((hasLoginCookie, cookie) => cookie.includes('loggedIn') ? cookie.split('=').pop() : hasLoginCookie, false);

        if (!this.state.loggedIn && username) this.setState({ username, loggedIn: true });
    }

    handleLogin = ({ username, loggedIn }) => {
        const date = new Date();
        date.setTime(`${date.getTime()}${(30 * 24 * 60 * 60 * 1000)}`); // set expiry to 30 days from now.
        
        const expiryDate = `; expiryDate=" ${date.toUTCString()}`;
        
        document.cookie = `loggedIn=${username || ''}${expiryDate}; path=/`;

        this.setState({ username, loggedIn });
    };

    render() {

        if (!this.state.loggedIn) {
            return <Login handleLogin={this.handleLogin} />;
        }
 
        return <Suspense fallback={<div className='App'>Loading...</div>}>
            <Index />;
        </Suspense>
    }
}

export default App;
