import { useState, useEffect } from "react";
import { apiService } from '../services/api';

const Deposit = () => {

    const [formData, setFormData] = useState({
        amount: '',
        accountNumber: '',
        description: ''
    });

    const [userAccounts, setUserAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchUserAccounts = async () => {
            try {
                const response = await apiService.getMyAccounts();
                if (response.data.statusCode === 200) {
                    setUserAccounts(response.data.data);
                    if (response.data.data.length > 0) {
                        setFormData(prev => ({
                            ...prev,
                            accountNumber: response.data.data[0].accountNumber
                        }));
                    }
                }
            } catch (error) {
                console.log(error)
            }
        }
        fetchUserAccounts()
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const formatCurrency = (amount, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('')

        // Validate form
        if (!formData.amount) {
            setError('Please fill in all required fields');
            setLoading(false);
            return;
        }

        if (parseFloat(formData.amount) <= 0) {
            setError('Amount must be greater than 0');
            setLoading(false);
            return;
        }

        try {
            const depositData = {
                transactionType: 'DEPOSIT',
                amount: parseFloat(formData.amount),
                accountNumber: formData.accountNumber,
                description: formData.description || null
            }

            const response = await apiService.makeDeposit(depositData);

            if (response.data.statusCode === 200) {
                setSuccess('Deposit completed successfully!');
                setFormData({
                    amount: '',
                    description: '',
                    accountNumber: userAccounts[0]?.accountNumber || ''
                });
                setTimeout(() => {
                    window.location.reload();
                }, 5000);
            } else {
                setError(response.data.message || 'Deposit failed');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred during transfer');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="transaction-container">
            <div className="transaction-header">
                <h1>Make a Deposit</h1>
            </div>
            <div className="transaction-content">
                <div className="transaction-form-section">
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    <form onSubmit={handleSubmit} className="transaction-form">
                        <div className="form-group">
                            <label htmlFor="accountNumber">Account</label>
                            <select
                                id="accountNumber"
                                name="accountNumber"
                                value={formData.accountNumber}
                                onChange={handleChange}
                                required
                            >
                                {userAccounts.map(account => (
                                    <option key={account.id} value={account.accountNumber}>
                                        {account.accountNumber} - {account.accountType} ({account.currency} {account.balance.toFixed(2)})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="amount">Amount *</label>
                            <input
                                type="number"
                                id="amount"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                placeholder="0.00"
                                min="0.01"
                                step="0.01"
                                required
                            />
                            {formData.amount && (
                                <div className="balance-check">
                                    <small>
                                        Available: {formatCurrency(
                                            userAccounts.find(acc => acc.accountNumber === formData.accountNumber)?.balance || 0
                                        )}
                                    </small>
                                </div>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <input
                                type="text"
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Optional description"
                            />
                        </div>
                        <button
                            type="submit"
                            className="transaction-btn"
                            disabled={loading}
                        >
                            {loading ? 'Processing Deposit...' : 'Deposit Money'}
                        </button>
                    </form>
                </div>
                <div className="transaction-guidelines">
                    <h3>Deposit Guidelines</h3>
                    <ul>
                        <li>Deposits are processed instantly</li>
                        <li>Double-check the amount before confirming</li>
                        <li>Deposit cannot be reversed once processed</li>
                        <li>Contact support if you encounter any issues</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default Deposit;