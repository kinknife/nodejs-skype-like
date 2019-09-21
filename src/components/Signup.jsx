const React = require('react');
const m_strUpperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const m_strLowerCase = "abcdefghijklmnopqrstuvwxyz";
const m_strNumber = "0123456789";
const m_strCharacters = "!@#$%^&*?_~"

class Signup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            text: '',
            star: 0,
            color: '#000000',
            showStrength: false
        }
    }
    
    checkPassword(strPassword) {
        // Reset combination count
        let nScore = 0;

        // Password length
        // -- Less than 4 characters
        if (strPassword.length < 5) {
            nScore += 5;
        }
        // -- 5 to 7 characters
        else if (strPassword.length > 4 && strPassword.length < 8) {
            nScore += 10;
        }
        // -- 8 or more
        else if (strPassword.length > 7) {
            nScore += 25;
        }

        // Letters
        let nUpperCount = this.countContain(strPassword, m_strUpperCase);
        let nLowerCount = this.countContain(strPassword, m_strLowerCase);
        let nLowerUpperCount = nUpperCount + nLowerCount;
        // -- Letters are all lower case
        if (nUpperCount == 0 && nLowerCount != 0) {
            nScore += 10;
        }
        // -- Letters are upper case and lower case
        else if (nUpperCount != 0 && nLowerCount != 0) {
            nScore += 20;
        }

        // Numbers
        let nNumberCount = this.countContain(strPassword, m_strNumber);
        // -- 1 number
        if (nNumberCount == 1) {
            nScore += 10;
        }
        // -- 3 or more numbers
        if (nNumberCount >= 3) {
            nScore += 20;
        }

        // Characters
        let nCharacterCount = this.countContain(strPassword, m_strCharacters);
        // -- 1 character
        if (nCharacterCount == 1) {
            nScore += 10;
        }
        // -- More than 1 character
        if (nCharacterCount > 1) {
            nScore += 25;
        }

        // Bonus
        // -- Letters and numbers
        if (nNumberCount != 0 && nLowerUpperCount != 0) {
            nScore += 2;
        }
        // -- Letters, numbers, and characters
        if (nNumberCount != 0 && nLowerUpperCount != 0 && nCharacterCount != 0) {
            nScore += 3;
        }
        // -- Mixed case letters, numbers, and characters
        if (nNumberCount != 0 && nUpperCount != 0 && nLowerCount != 0 && nCharacterCount != 0) {
            nScore += 5;
        }

        return nScore;
    }

    countContain(strPassword, strCheck) {
        // Declare variables
        let nCount = 0;

        for (i = 0; i < strPassword.length; i++) {
            if (strCheck.indexOf(strPassword.charAt(i)) > -1) {
                nCount++;
            }
        }

        return nCount;
    }

    passStrength() {
        let password = this.password.value;
        let nScore = this.checkPassword(password);

        if (nScore >= 80) {
            this.setState({
                text: 'Very Strong',
                star: 5,
                color: "#008000",
                showStrength: true
            })
        } else if (nScore >= 60) {
            this.setState({
                text: 'Strong',
                star: 4,
                color: "#006000",
                showStrength: true
            })
        } else if (nScore >= 40) {
            this.setState({
                text: 'Average',
                star: 3,
                color: "#e3cb00",
                showStrength: true
            })
        } else if (nScore >= 20) {
            this.setState({
                text: 'Weak',
                star: 2,
                color: "#Fe3d1a",
                showStrength: true
            })
        } else {
            this.setState({
                text: 'Very Weak',
                star: 1,
                color: "#e71a1a",
                showStrength: true
            })
        }
    }

    getMeter() {
        let bars = []
        for (let i = 0; i < this.state.star; ++i) {
            bars.push(<div className="bar" style={{ backgroundColor: this.state.color }} key={i}></div>)
        }
        return bars
    }

    validate() {
        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        let emailInput = this.email.closest('.input');
        let passInput = this.password.closest('.input');
        let repassInput = this.rePassword.closest('.input');
        let nameInput = this.name.closest('.input');

        if(!this.email.value || this.email.value === '') {
            this.emailErr.innerText = 'Please enter your email';
            if(!emailInput.classList.contains('error')) {
                emailInput.classList.add('error');
            }
            return false;
        }

        if(!re.test(this.email.value)) {
            this.emailErr.innerText = 'Email format is invalid. Please reenter your email';
            if(!emailInput.classList.contains('error')) {
                emailInput.classList.add('error');
            }
            return false;
        }

        if(emailInput.classList.contains('error')) {
            emailInput.classList.remove('error');
        }
        this.emailErr.innerText = '';

        if(!this.name.value || this.name.value === '') {
            this.nameErr.innerText = 'Please enter your fullname';
            if(!nameInput.classList.contains('error')) {
                nameInput.classList.add('error');
            }
            return false;
        }

        this.nameErr.innerText = '';
        if(nameInput.classList.contains('error')) {
            nameInput.classList.remove('error');
        }

        if(!this.password.value || this.password.value === '') {
            this.passErr.innerText = 'Please enter your password';
            if(!passInput.classList.contains('error')) {
                passInput.classList.add('error');
            }
            return false;
        }

        if(this.rePassword.value !== this.password.value) {
            this.passErr.innerText = 'The password and its comfirmation is not math';
            if(!passInput.classList.contains('error')) {
                passInput.classList.add('error');
            }
            if(!repassInput.classList.contains('error')) {
                repassInput.classList.add('error');
            }
            return false;
        }

        if(passInput.classList.contains('error')) {
            passInput.classList.remove('error');
        }
        if(repassInput.classList.contains('error')) {
            repassInput.classList.remove('error');
        }

        this.passErr.innerText = ''

        return true;
    }

    submit() {
        if(!this.validate()) {
            return;
        }

        let user = {
            email: this.email.value,
            password: this.password.value,
            name: this.name.value
        }

        this.props.connections.postHTTP(user, 'signup').then(res => {
            if(res.succeed) {
                this.props.utils.setCookie('token',res.token, 1)
                this.props.changePage('EditInfo', {
                    state: {
                        user: res.user,
                        signedIn: true
                    },
                    nextPageProps: {
                        user: res.user
                    }
                });
            }
        });
    }

    render() {
        return (
            <div className="log-container">
                <div className="logo"></div>
                <div className="title">Sign up for Vtalk</div>
                <div className="inputs-container">
                    <div className="input-container">
                        <div className="input-label">Email</div>
                        <div className="input">
                            <input placeholder="Enter your email" ref={(email) => {this.email = email}}></input>
                        </div>
                        <div className="error-text" ref={(emailErr) => {this.emailErr = emailErr}}></div>
                    </div>
                    <div className="input-container">
                        <div className="input-label">Full Name</div>
                        <div className="input">
                            <input placeholder="Enter your name" ref={(name) => {this.name = name}}></input>
                        </div>
                        <div className="error-text" ref={(nameErr) => {this.nameErr = nameErr}}></div>
                    </div>
                    <div className="sub-input-container">
                        <div className="input-container">
                            <div className="input-label">Password</div>
                            <div className="input">
                                <input placeholder="Enter your password" ref={(password) => {this.password = password}} onChange={() => {this.passStrength()}} type="password"></input>
                            </div>
                        </div>
                        <div className="input-container">
                            <div className="input-label">Comfirm Password</div>
                            <div className="input">
                                <input placeholder="Re-enter your password" type="password" ref={(rePassword) => {this.rePassword = rePassword}}></input>
                            </div>
                        </div>
                    </div>
                    <div className="error-text" ref={(passErr) => {this.passErr = passErr}}></div>
                    {this.state.showStrength ?
                        <div className="pass-strength-meter">
                            {this.getMeter()}
                            <div className="strength-text" style={{ color: this.state.color }}>{this.state.text}</div>
                        </div>
                        : null}
                    <div className="error-text">{this.state.error}</div>
                </div>
                <button className="action-btn" onClick={() => {this.submit()}}>Sign Up</button>
                <div className="footer">
                    Have an account? <a onClick={() => {this.props.changePage('SignIn')}}>Sign In</a>
                </div>
            </div>
        );
    }
}

module.exports = Signup;