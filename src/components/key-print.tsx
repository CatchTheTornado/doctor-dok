import React from "react";

export class KeyPrint extends React.PureComponent {
    constructor(props) {
      super(props);
    }    
    
    render () {
        return (
            <div class="m-6">
                <h2 class="text-xl">Patient Pad Encryption Key</h2>
                <div class="mt-10 mb-10 p-5 border-dashedborder-dashed border-2 border-gray"><strong>{this.props.text}</strong></div>
                <div><strong>Important:</strong> please store this key in safety. Patient Pad is using AES256 end 2 end encryption using THIS KEY. It means when you loose it we can not decrypt your data in any way. It's like crypto wallet.</div>
            </div>
        )
    }
}