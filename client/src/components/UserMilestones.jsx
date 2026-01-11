import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import './UserMilestones.css';

const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

const UserMilestones = () => {
    const [milestones, setMilestones] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMilestones = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await axios.get(`${API_BASE_URL}/api/milestones`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setMilestones(response.data);
            } catch (err) {
                console.error('Error fetching milestones:', err);
                console.error('Error response:', err?.response);
                console.error('Error status:', err?.response?.status);
                const errorMsg = err?.response?.data?.error 
                    || err?.message 
                    || `Failed to load milestones (${err?.response?.status || 'unknown error'})`;
                setError(errorMsg);
            } finally {
                setLoading(false);
            }
        };

        fetchMilestones();
    }, [navigate]);

    if (loading) {
        return (
            <div className="milestones-container">
                <div className="milestones-loading">
                    <div className="auth-loading-spinner"></div>
                    <p>Loading your milestones...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="milestones-container">
                <div className="milestones-error">
                    <p>Error: {error}</p>
                    <button onClick={() => window.location.reload()}>Retry</button>
                </div>
            </div>
        );
    }

    if (!milestones) {
        return (
            <div className="milestones-container">
                <div className="milestones-empty">
                    <p>No data available. Start training some Pokemon!</p>
                </div>
            </div>
        );
    }

    // Prepare data for charts
    const evBreakdownData = [
        { name: 'HP', value: milestones.evBreakdown.hp, stat: 'hp' },
        { name: 'Attack', value: milestones.evBreakdown.attack, stat: 'attack' },
        { name: 'Defense', value: milestones.evBreakdown.defense, stat: 'defense' },
        { name: 'Sp. Attack', value: milestones.evBreakdown.specialAttack, stat: 'specialAttack' },
        { name: 'Sp. Defense', value: milestones.evBreakdown.specialDefense, stat: 'specialDefense' },
        { name: 'Speed', value: milestones.evBreakdown.speed, stat: 'speed' }
    ].filter(item => item.value > 0);

    const itemsData = Object.entries(milestones.itemsUsed.byItem || {})
        .map(([item, count]) => ({
            name: item.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            count: count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    const mostTrainedData = milestones.mostTrainedPokemon
        .slice(0, 10)
        .map(p => ({
            name: p.name || `#${p.speciesNumber}`,
            count: p.count,
            totalEVs: p.totalEVs
        }));

    const natureData = Object.entries(milestones.natureDistribution || {})
        .map(([nature, count]) => ({
            name: nature.charAt(0).toUpperCase() + nature.slice(1),
            count: count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    return (
        <div className="milestones-container">
            <div className="milestones-header">
                <h1>🎯 Training Milestones</h1>
                <p className="milestones-subtitle">Your Pokemon EV training statistics</p>
            </div>

            {/* Summary Cards */}
            <div className="milestones-summary">
                <div className="milestone-card">
                    <div className="milestone-icon">⚡</div>
                    <div className="milestone-content">
                        <h3>{milestones.pokemonTrained}</h3>
                        <p>Pokemon Trained</p>
                    </div>
                </div>

                <div className="milestone-card">
                    <div className="milestone-icon">💪</div>
                    <div className="milestone-content">
                        <h3>{milestones.totalEVsTrained.toLocaleString()}</h3>
                        <p>Total EVs Trained</p>
                    </div>
                </div>

                <div className="milestone-card">
                    <div className="milestone-icon">⭐</div>
                    <div className="milestone-content">
                        <h3>{milestones.fullyTrainedPokemon}</h3>
                        <p>Fully Trained (510 EVs)</p>
                    </div>
                </div>

                <div className="milestone-card">
                    <div className="milestone-icon">📊</div>
                    <div className="milestone-content">
                        <h3>{milestones.averageLevel.toFixed(1)}</h3>
                        <p>Average Level</p>
                    </div>
                </div>
            </div>

            {/* EV Breakdown Chart */}
            {evBreakdownData.length > 0 && (
                <div className="milestones-section">
                    <h2>EV Distribution by Stat</h2>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={evBreakdownData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" fill="#36A2EB" name="EVs Trained">
                                    {evBreakdownData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Most Trained Pokemon */}
            {mostTrainedData.length > 0 && (
                <div className="milestones-section">
                    <h2>Most Trained Pokemon</h2>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={mostTrainedData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={120} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#FF6384" name="Pokemon Count" />
                                <Bar dataKey="totalEVs" fill="#FFCE56" name="Total EVs" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Items Used */}
            {itemsData.length > 0 && (
                <div className="milestones-section">
                    <h2>Items Currently Held</h2>
                    <p className="section-note">Note: Shows items currently held, not items consumed during training</p>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={itemsData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#4BC0C0" name="Pokemon with Item" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Nature Distribution */}
            {natureData.length > 0 && (
                <div className="milestones-section">
                    <h2>Nature Distribution</h2>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={400}>
                            <PieChart>
                                <Pie
                                    data={natureData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={120}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {natureData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Additional Stats Table */}
            <div className="milestones-section">
                <h2>Additional Statistics</h2>
                <div className="stats-table">
                    <div className="stat-row">
                        <span className="stat-label">Pokemon with Items:</span>
                        <span className="stat-value">{milestones.totalPokemonWithItems}</span>
                    </div>
                    <div className="stat-row">
                        <span className="stat-label">Pokemon without Items:</span>
                        <span className="stat-value">{milestones.pokemonWithoutItems}</span>
                    </div>
                    <div className="stat-row">
                        <span className="stat-label">Total Items Held:</span>
                        <span className="stat-value">{milestones.itemsUsed.total}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserMilestones;
