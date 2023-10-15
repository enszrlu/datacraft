import './globals.css';

export const metadata = {
    title: 'DataCraft',
    description: 'Online Data Analytics & Statistics & Process Improvements for your business'
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
