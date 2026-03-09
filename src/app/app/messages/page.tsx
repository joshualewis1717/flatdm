//messages page

//for all users this page will display all the messages they have received and sent in a conversation format, users cannot start a new conversation but they can reply to existing ones.

//users can report a conversation if they find it inappropriate


export default function MessagesPage() {
    return (
        <div>
            <h1>Messages page</h1>
            <p>This page will display all the messages for landlords, moderators, and consultants.</p>
            <p>Landlords will see only their messages, while moderators and consultants will see all messages.</p>
            <p>Each message will be displayed using a reusable MessageCard component, and clicking on a message will take users to a detailed page.</p>
        </div>
    );
}