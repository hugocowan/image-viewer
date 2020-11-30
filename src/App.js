import React, { Suspense } from 'react';
const Index = React.lazy(() => import('./pages/Index'));
import Login from './pages/Login';
import './style/App.scss';
import './style/Login.scss';

class App extends React.Component {

    state = {
        username: false,
        loggedIn: false
    }

    handleLogin = ({ username, loggedIn }) => {
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
