import React from 'react';

// todo:
// Add a small relatively positioned navbar at the top.
// Add different sorting options - random, natural, natural reversed.

class Navbar extends React.Component {
    
    constructor (props) {
        super(props);

        this.state = {
            showNav: false
        };
    }

    renderBurger = () => {
        return <div className={`burger ${this.state.showNav}`} onClick={() => this.setState({ showNav: !this.state.showNav })}>
            <div />
            <div />
            <div />
        </div>
    };

    render() {

        const { handleSortChange, sortType } = this.props;

        return (
            <nav>
                <this.renderBurger />
                {this.state.showNav &&
                    <ul>
                        <li 
                            className={`${sortType === 'shuffle'}`} 
                            onClick={() => handleSortChange('shuffle')}
                        >
                            Shuffle
                        </li>
                        <li 
                            className={`${sortType === 'natural'}`} 
                            onClick={() => handleSortChange('natural')}
                        >
                            Natural
                        </li>
                        <li 
                            className={`${sortType === 'naturalReverse'}`} 
                            onClick={() => handleSortChange('naturalReverse')}
                        >
                            Natural Reverse
                        </li>
                    </ul>}
            </nav>
        );
    }
}

export default Navbar;