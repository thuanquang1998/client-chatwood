import ChatBot from "react-chatbotify";
import React from 'react';
import ReactDOM from 'react-dom';
import styles from './themes/soft_sky_blue/styles.json'
import './themes/soft_sky_blue/styles.css'
import iconImg from '../../assets/icon_chatbot.png'
import { GoogleGenerativeAI } from "@google/generative-ai";


const MyChatBot = () => {

    // realtime-stream
    let apiKey = "AIzaSyCZ8eM7cGHau4eY4cxKA_hP5U6iDm6DT3k";
	const modelType = "gemini-pro";
	let hasError = false;

	const [form, setForm] = React.useState({});
    const [isShow, setIsShow] = React.useState(true)
	const formStyle = {
		marginTop: 10,
		marginLeft: 20,
		border: "1px solid #491d8d",
		padding: 10,
		borderRadius: 5,
		maxWidth: 300
	};

    const gemini_stream = async (params) => {
		try {
            console.log("apiKey ",apiKey);
            
			const genAI = new GoogleGenerativeAI(apiKey);
			const model = genAI.getGenerativeModel({ model: modelType });
			const result = await model.generateContentStream(params.userInput);

			let text = "";
			let offset = 0;
			for await (const chunk of result.stream) {
				const chunkText = chunk.text();
				text += chunkText;
				// inner for-loop used to visually stream messages character-by-character
				// feel free to remove this loop if you are alright with visually chunky streams
				for (let i = offset; i < chunkText.length; i++) {
					// while this example shows params.streamMessage taking in text input,
					// you may also feed it custom JSX.Element if you wish
					await params.streamMessage(text.slice(0, i + 1));
					await new Promise(resolve => setTimeout(resolve, 30));
				}
				offset += chunkText.length;
			}

			// in case any remaining chunks are missed (e.g. timeout)
			// you may do your own nicer logic handling for large chunks
			for (let i = offset; i < text.length; i++) {
				await params.streamMessage(text.slice(0, i + 1));
				await new Promise(resolve => setTimeout(resolve, 30));
			}
			await params.streamMessage(text);

			// we call endStreamMessage to indicate that all streaming has ended here
			await params.endStreamMessage();
		} catch (error) {
            console.log("error ",error);
            
			await params.injectMessage("Unable to load model, is your API Key valid?");
			hasError = true;
		}
	}

    const flowStream={
		start: {
			message: "Enter your Gemini api key and start asking away!",
			path: "api_key",
			isSensitive: true
		},
		api_key: {
			message: (params) => {
				apiKey = params.userInput.trim();
				return "Ask me anything!";
			},
			path: "loop",
		},
		loop: {
			message: async (params) => {
				await gemini_stream(params);
			},
			path: () => {
				if (hasError) {
					return "start"
				}
				return "loop"
			}
		}
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
            path: "ask_additional_info"
        },
        ask_additional_info: {
            message: "Please provide any additional information you would like us to know:",
            function: (params) => setForm({ ...form, additional_info: params.userInput }),
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
                    <p>Additional Information: {form.additional_info}</p>
                </div>
            ),
            options: ["Start a New Inquiry"],
            chatDisabled: true,
            path: "start"
        },
    };

    const flowBankAndStream = {
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
            path: "upload_resume"
        },
        // ask_additional_info: {
        //     message: "Please provide any additional information you would like us to know:",
        //     function: (params) => {
        //         setForm({ ...form, additional_info: params.userInput });
        //         // Add Gemini API key to transition
        //         // apiKey = "AIzaSyCZ8eM7cGHau4eY4cxKA_hP5U6iDm6DT3k";
        //     },
        //     path: "loop"
        // },
        // loop: {
        //     message: async (params) => {
        //         await gemini_stream(params);
                
        //     },
        //     path: () => {
        //         if (hasError) {
        //             return "start"
        //         }
        //         return "loop"
        //     }
        // },
        upload_resume: {
			message: (params) => `Please upload your resume.`,
			chatDisabled: true,
			file: (params) => handleUpload(params),
			path: "ask_additional_info"
		},
        ask_additional_info: {
            message: "Please provide any additional information you would like us to know:",
            function: (params) => {
                setForm({ ...form, additional_info: params.userInput });
                // Add Gemini API key to transition
                // apiKey = "AIzaSyCZ8eM7cGHau4eY4cxKA_hP5U6iDm6DT3k";
            },
            path: "loop"
        },
        
        loop: {
            message: async (params) => {
                await gemini_stream(params);
            },
            path: () => {
                if (hasError) {
                    return "start"
                }
                return "loop"
            }
        }
    };

    // Example file upload function
    async function handleUpload(params) {
        const files = params.files;
        // Implement your file upload logic here
        // This could be a call to an API endpoint that handles file uploads
        console.log("Uploading file:", files);
    }

    const chatbotStyle = {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        // width: '300px',
        // height: '400px',
        // border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: '#fff',
        zIndex: 1000,
    };

	return (
        <div style={chatbotStyle}>
            <div className="fixed bottom-5 right-5">
                {!isShow?
                <button onClick={() => setIsShow(true)}>
                    <img className="w-16 h-16" src={iconImg} alt="icon"/>
                </button>:
                <ChatBot 
                    settings={{
                        general: {
                            // embedded: true,
                            "primaryColor": "#4AB0D0",
                            "secondaryColor": "#daedf2",
                            "showFooter": true,
                        },
                        voice: {disabled: false},
                        chatHistory: {storageKey: "example_file_upload"},
                        botBubble: {simStream: true},
                        ariaLabel: {
                            chatButton: "Chatbot IDB",
                            closeChatButton: <button>aaaaa</button>
                        },
                        fileAttachment: {
                            disabled:false
                        },
                        emoji: {
                            disabled:false
                        },
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
                    flow={flowBankAndStream}
                    onSend={(params) => console.log("params ",params)}
                />}
            </div>
        </div>
		
	);
};

window.initChatbot = () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    ReactDOM.render(<MyChatBot />, container);
};

export default MyChatBot