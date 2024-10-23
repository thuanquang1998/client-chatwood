import ChatBot from "react-chatbotify";
import React from 'react';
import ReactDOM from 'react-dom';
import styles from './themes/soft_sky_blue/styles.json'
import './themes/soft_sky_blue/styles.css'

const MyChatBot = () => {
	const [form, setForm] = React.useState({});
	const formStyle = {
		marginTop: 10,
		marginLeft: 20,
		border: "1px solid #491d8d",
		padding: 10,
		borderRadius: 5,
		maxWidth: 300
	}

	const flow={
		start: {
			message: "Hello there! What is your name?",
			function: (params) => setForm({...form, name: params.userInput}),
			path: "ask_age"
		},
		ask_age: {
			message: (params) => `Nice to meet you ${params.userInput}, what is your age?`,
			function: (params) => setForm({...form, age: params.userInput}),
			path: "ask_pet"
		},
		ask_pet: {
			message: "Do you own any pets?",
			// alternative way to declare options, with sending of output disabled
			// more info here: https://react-chatbotify.com/docs/api/attributes
			// options: {items: ["Yes", "No"], sendOutput: false}
			options: ["Yes", "No"],
			chatDisabled: true,
			function: (params) => setForm({...form, pet_ownership: params.userInput}),
			path: "ask_choice"
		},
		ask_choice: {
			message: "Select at least 2 pets that you are comfortable to work with:",
			// alternative way to declare checkboxes, with default configurations (i.e. min 1, max 4, send output and not reusable)
			// more info here: https://react-chatbotify.com/docs/api/attributes
			// checkboxes: ["Dog", "Cat", "Rabbit", "Hamster"]
			checkboxes: {items: ["Dog", "Cat", "Rabbit", "Hamster"], min: 2},
			chatDisabled: true,
			function: (params) => setForm({...form, pet_choices: params.userInput}),
			path: "ask_work_days"
		},
		ask_work_days: {
			message: "How many days can you work per week?",
			function: (params) => setForm({...form, num_work_days: params.userInput}),
			path: "end"
		},
		end: {
			message: "Thank you for your interest, we will get back to you shortly!",
			component: (
				<div style={formStyle}>
					<p>Name: {form.name}</p>
					<p>Age: {form.age}</p>
					<p>Pet Ownership: {form.pet_ownership}</p>
					<p>Pet Choices: {form.pet_choices}</p>
					<p>Num Work Days: {form.num_work_days}</p>
				</div>
			),
			options: ["New Application"],
			chatDisabled: true,
			path: "start"
		},
	};

    const flowBank = {
        start: {
            message: "Welcome to ABC Bank! What is your name?",
            function: (params) => setForm({ ...form, name: params.userInput }),
            path: "ask_account_type"
        },
        ask_account_type: {
            message: (params) => `Nice to meet you ${params.userInput}! What type of account are you interested in?`,
            options: ["Checking Account", "Savings Account", "Business Account"],
            chatDisabled: true,
            function: (params) => setForm({ ...form, account_type: params.userInput }),
            path: "ask_income"
        },
        ask_income: {
            message: "What is your monthly income?",
            function: (params) => setForm({ ...form, income: params.userInput }),
            path: "ask_loans"
        },
        ask_loans: {
            message: "Are you interested in applying for a loan?",
            options: ["Yes", "No"],
            chatDisabled: true,
            function: (params) => setForm({ ...form, loan_interest: params.userInput }),
            path: "ask_loan_amount"
        },
        ask_loan_amount: {
            message: "If yes, how much would you like to borrow?",
            function: (params) => setForm({ ...form, loan_amount: params.userInput }),
            path: "ask_contact_method"
        },
        ask_contact_method: {
            message: "How would you like us to contact you?",
            checkboxes: { items: ["Phone", "Email", "SMS"], min: 1 },
            chatDisabled: true,
            function: (params) => setForm({ ...form, contact_method: params.userInput }),
            path: "end"
        },
        end: {
            message: "Thank you for your interest in ABC Bank! Here’s what we have recorded:",
            component: (
                <div style={formStyle}>
                    <p>Name: {form.name}</p>
                    <p>Account Type: {form.account_type}</p>
                    <p>Monthly Income: {form.income}</p>
                    <p>Loan Interest: {form.loan_interest}</p>
                    <p>Loan Amount: {form.loan_amount}</p>
                    <p>Contact Method: {form.contact_method}</p>
                </div>
            ),
            options: ["Start a New Inquiry"],
            chatDisabled: true,
            path: "start"
        },
    };

    const chatbotStyle = {
        position: 'fixed',
        bottom: '180px',
        right: '100px',
        width: '300px',
        height: '400px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: '#fff',
        zIndex: 1000,
    };

	return (
        <div style={chatbotStyle}>
            <ChatBot 
            settings={{
                general: {
                    embedded: true,
                    "primaryColor": "#4AB0D0",
                    "secondaryColor": "#daedf2",
                    "showFooter": false
                },
                chatHistory: {storageKey: "example_basic_form"},
                // "chatInput": {
                //     "enabledPlaceholderText": "How can I help you?"
                // },
                // "notification": {
                //     "disabled": true
                // },
                "header": {
                    "showAvatar": true,
                    "title": "Chatbot IDB",
                }
            }} 
            styles={styles}
            flow={flowBank}
            onSend={(params) => console.log("params ",params)}
        />
        </div>
		
	);
};

window.initChatbot = () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    ReactDOM.render(<MyChatBot />, container);
};

export default MyChatBot