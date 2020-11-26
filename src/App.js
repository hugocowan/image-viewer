import React, { Suspense } from 'react';
const Index = React.lazy(() => import('./pages/Index'));

class App extends React.Component {
    render() {
        return <Suspense fallback={<div className='App'>Loading...</div>}>
            <Index />;
        </Suspense>
    }
}

export default App;
