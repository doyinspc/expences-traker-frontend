import React from 'react'
const MathJax = require('react-mathjax')

export default function Formular(props) {
    return (
        <MathJax.Provider>
            <div>
                This is an inline math formula: <MathJax.Node inline formula={'a = b'} />
                And a block one:
 
                <MathJax.Node formula={props.value} />
            </div>
        </MathJax.Provider>
    );
}

    
