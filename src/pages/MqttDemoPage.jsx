import { useState, useEffect, useRef } from 'react';
import mqtt from 'mqtt';
import { FaWifi, FaPaperPlane, FaClock } from 'react-icons/fa';
import { FiRadio as FaBroadcast, FiWifiOff as FaWifiSlash } from 'react-icons/fi';

const MQTT_WS = import.meta.env.VITE_MQTT_WS || 'ws://localhost:9010';

export function MqttDemoPage() {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
    const mqttRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const client = mqtt.connect(MQTT_WS, { reconnectPeriod: 3000 });
    mqttRef.current = client;

    client.on('connect', () => {
      setConnected(true);
      addLog('✅ Connected to MQTT Broker', 'system');
      
      // Subscribe to all bodaboda topics
      client.subscribe('bodaboda/ride/request');
      client.subscribe('bodaboda/driver/location');
      client.subscribe('bodaboda/ride/status');
      addLog('📡 Subscribed to all topics', 'system');
    });

    client.on('message', (topic, payload) => {
      try {
        const data = JSON.parse(payload.toString());
        addLog(`📨 ${topic}`, 'received', data);
      } catch (e) {
      console.error(e);
        addLog(`📨 ${topic}: ${payload.toString()}`, 'received');
      }
    });

    client.on('error', (err) => {
      addLog(`❌ Error: ${err.message}`, 'error');
    });

    client.on('close', () => {
      setConnected(false);
      addLog('🔴 Disconnected', 'system');
    });

    return () => client.end();
  }, []);

  function addLog(text, type, data = null) {
    const timestamp = new Date().toLocaleTimeString();
    setMessages(prev => [...prev, { text, type, timestamp, data }]);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const publishTestMessage = () => {
    if (!mqttRef.current || !connected) {
      addLog('❌ Not connected to MQTT', 'error');
      return;
    }

    const payload = {
      passenger_id: 1,
      passenger_name: 'Demo Passenger',
      pickup_location: 'Dodoma City Center',
      destination: 'University of Dodoma',
      fare: 5000,
      timestamp: new Date().toISOString(),
    };

    mqttRef.current.publish('bodaboda/ride/request', JSON.stringify(payload));
    addLog('📤 Published: bodaboda/ride/request', 'sent', payload);
  };

  const simulateDriverLocation = () => {
    if (!mqttRef.current || !connected) {
      addLog('❌ Not connected to MQTT', 'error');
      return;
    }

    const payload = {
      driver_id: 1,
      driver_name: 'Demo Rider',
      lat: -6.1639 + (Math.random() * 0.01 - 0.005),
      lng: 35.7516 + (Math.random() * 0.01 - 0.005),
      status: 'online',
      timestamp: new Date().toISOString(),
    };

    mqttRef.current.publish('bodaboda/driver/location', JSON.stringify(payload));
    addLog('📤 Published: bodaboda/driver/location', 'sent', payload);
  };

  const clearLog = () => setMessages([]);

  return (
    <div className="min-h-screen bg-twende-navy font-jakarta text-twende-text p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-twende-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <div className="max-w-4xl mx-auto relative z-10 pt-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-twende-text mb-2 flex items-center justify-center gap-3 drop-shadow-md">
            <span className="w-12 h-12 rounded-2xl bg-twende-primary/20 border border-twende-primary/30 flex items-center justify-center shadow-glow text-twende-primary"><FaBroadcast /></span>
            MQTT Live Demo
          </h1>
          <p className="text-twende-text-secondary text-sm uppercase tracking-widest font-bold mt-3">Real-time messaging demonstration for presentation</p>
        </div>

        {/* Connection Status */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className={`glass-panel rounded-3xl p-6 text-center shadow-lg transition-all ${connected ? 'bg-green-500/10 border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'bg-red-500/10 border-red-500/30'}`}>
            <div className="text-4xl mb-3 flex justify-center">
              {connected ? <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 animate-pulse"><FaWifi /></div> : <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center text-red-400"><FaWifiSlash /></div>}
            </div>
            <p className="font-black text-lg text-twende-text">{connected ? 'MQTT Connected' : 'MQTT Disconnected'}</p>
            <p className="text-[10px] text-twende-text-secondary mt-2 uppercase tracking-widest font-bold">{MQTT_WS}</p>
          </div>

          <div className="glass-panel rounded-3xl p-6 text-center border-twende-border shadow-lg">
            <div className="text-4xl mb-3 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-twende-primary/20 flex items-center justify-center text-twende-primary shadow-glow"><FaClock /></div>
            </div>
            <p className="font-black text-lg text-twende-text">{messages.length} Messages</p>
            <p className="text-[10px] text-twende-text-secondary mt-2 uppercase tracking-widest font-bold">Total exchanged</p>
          </div>
        </div>

        {/* Test Controls */}
        <div className="glass-panel rounded-3xl p-6 mb-6 border-twende-border shadow-xl">
          <h2 className="font-black text-lg mb-5 text-twende-text flex items-center gap-2"><span className="text-twende-accent text-xl">🧪</span> Test Controls</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={publishTestMessage}
              disabled={!connected}
              className="py-4 px-4 rounded-2xl bg-twende-primary hover:bg-twende-primary-dark text-white font-black disabled:opacity-50 disabled:hover:bg-twende-primary disabled:shadow-none transition-all shadow-glow transform hover:-translate-y-0.5 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
            >
              <FaPaperPlane className="text-lg" /> Send Ride Request
            </button>
            <button
              onClick={simulateDriverLocation}
              disabled={!connected}
              className="py-4 px-4 rounded-2xl bg-blue-500 hover:bg-blue-600 text-twende-text font-black disabled:opacity-50 disabled:hover:bg-blue-500 disabled:shadow-none transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] transform hover:-translate-y-0.5 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
            >
              <FaBroadcast className="text-lg" /> Send Driver GPS
            </button>
          </div>
        </div>

        {/* Message Log */}
        <div className="glass-panel rounded-3xl p-6 border-twende-border shadow-xl">
          <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-4">
            <h2 className="font-black text-lg text-twende-text flex items-center gap-2"><span className="text-twende-primary text-xl">📨</span> Live Message Log</h2>
            <button onClick={clearLog} className="text-xs font-bold uppercase tracking-widest text-twende-text-secondary hover:text-red-400 transition-colors bg-gray-100 px-3 py-1.5 rounded-lg border border-twende-border">Clear</button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {messages.length === 0 && (
              <p className="text-twende-text-secondary text-center py-10 font-medium text-sm border-2 border-dashed border-white/5 rounded-2xl">No messages yet... Click buttons above to send test messages</p>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-4 rounded-2xl text-sm border transition-all ${
                  msg.type === 'sent' ? 'bg-blue-500/10 border-blue-500/30' :
                  msg.type === 'received' ? 'bg-green-500/10 border-green-500/30' :
                  msg.type === 'error' ? 'bg-red-500/10 border-red-500/30' :
                  'bg-gray-100 border-twende-border'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-twende-text-secondary whitespace-nowrap mt-1">{msg.timestamp}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold ${msg.type === 'sent' ? 'text-blue-400' : msg.type === 'received' ? 'text-green-400' : msg.type === 'error' ? 'text-red-400' : 'text-twende-text-secondary'}`}>{msg.text}</p>
                    {msg.data && (
                      <pre className="mt-2 text-[11px] text-twende-text-secondary bg-black/40 p-3 rounded-xl overflow-x-auto border border-white/5 custom-scrollbar">
                        {JSON.stringify(msg.data, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* MQTT Topics Info */}
        <div className="mt-6 glass-panel rounded-3xl p-6 border-twende-border shadow-xl mb-12">
          <h2 className="font-black text-lg mb-5 text-twende-text flex items-center gap-2"><span className="text-blue-400 text-xl">📡</span> MQTT Topics</h2>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-4 bg-gray-100 border border-white/5 rounded-2xl hover:bg-gray-100 transition-colors">
              <span className="text-twende-primary font-mono font-bold bg-twende-primary/10 px-3 py-1 rounded-lg">bodaboda/ride/request</span>
              <span className="text-twende-text-secondary text-xs font-bold uppercase tracking-widest">→ Passenger requests ride</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-4 bg-gray-100 border border-white/5 rounded-2xl hover:bg-gray-100 transition-colors">
              <span className="text-green-400 font-mono font-bold bg-green-500/10 px-3 py-1 rounded-lg">bodaboda/driver/location</span>
              <span className="text-twende-text-secondary text-xs font-bold uppercase tracking-widest">→ Driver GPS updates</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-4 bg-gray-100 border border-white/5 rounded-2xl hover:bg-gray-100 transition-colors">
              <span className="text-twende-accent font-mono font-bold bg-twende-accent/10 px-3 py-1 rounded-lg">bodaboda/ride/status</span>
              <span className="text-twende-text-secondary text-xs font-bold uppercase tracking-widest">→ Trip status changes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MqttDemoPage;
