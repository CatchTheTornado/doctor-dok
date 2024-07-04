import React from "react";

export class KeyPrint extends React.PureComponent {
    constructor(props) {
      super(props);
    }    
    
    render () {
        return (
            <div className="m-6">
                <h2 className="text-xl">Patient Pad Encryption Key</h2>
                <div className="mt-10 mb-10 p-5 border-dashedborder-dashed border-2 border-zinc"><strong>{this.props.text}</strong></div>
                <div><strong>Important:</strong> please store this key in safety. Patient Pad is using AES256 end 2 end encryption using THIS KEY. It means when you loose it we can not decrypt your data in any way. It's like crypto wallet.</div>
            </div>
        )
    }
}