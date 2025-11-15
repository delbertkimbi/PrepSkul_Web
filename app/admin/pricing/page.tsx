'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AdminNav from '../components/AdminNav';

export default function PricingControlsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Trial session pricing
  const [trial30Price, setTrial30Price] = useState(2000);
  const [trial60Price, setTrial60Price] = useState(3500);
  
  // Discount rules
  const [discountRules, setDiscountRules] = useState<any[]>([]);
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    discountPercent: 0,
    discountAmount: 0,
    criteria: { all: false, rating_min: '', rating_max: '', qualification: '', subject: '' },
    isActive: true,
  });

  useEffect(() => {
    loadPricing();
  }, []);

  const loadPricing = async () => {
    try {
      setLoading(true);
      
      // Load trial session pricing
      const { data: trialPricing } = await supabase
        .from('trial_session_pricing')
        .select('*')
        .order('duration_minutes');
      
      if (trialPricing) {
        trialPricing.forEach((pricing: any) => {
          if (pricing.duration_minutes === 30) {
            setTrial30Price(pricing.price_xaf);
          } else if (pricing.duration_minutes === 60) {
            setTrial60Price(pricing.price_xaf);
          }
        });
      }
      
      // Load discount rules
      const { data: rules } = await supabase
        .from('tutor_discount_rules')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (rules) {
        setDiscountRules(rules);
      }
    } catch (error) {
      console.error('Error loading pricing:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTrialPricing = async () => {
    try {
      setSaving(true);
      
      // Upsert trial session pricing
      await supabase
        .from('trial_session_pricing')
        .upsert([
          { duration_minutes: 30, price_xaf: trial30Price, is_active: true },
          { duration_minutes: 60, price_xaf: trial60Price, is_active: true },
        ], { onConflict: 'duration_minutes' });
      
      alert('Trial session pricing saved successfully!');
    } catch (error) {
      console.error('Error saving trial pricing:', error);
      alert('Error saving trial pricing');
    } finally {
      setSaving(false);
    }
  };

  const saveDiscountRule = async () => {
    try {
      setSaving(true);
      
      const criteria: any = {};
      if (newRule.criteria.all) {
        criteria.all = true;
      } else {
        if (newRule.criteria.rating_min) criteria.rating_min = parseFloat(newRule.criteria.rating_min);
        if (newRule.criteria.rating_max) criteria.rating_max = parseFloat(newRule.criteria.rating_max);
        if (newRule.criteria.qualification) criteria.qualification = newRule.criteria.qualification;
        if (newRule.criteria.subject) criteria.subject = newRule.criteria.subject;
      }
      
      await supabase
        .from('tutor_discount_rules')
        .insert({
          name: newRule.name,
          description: newRule.description,
          discount_percent: newRule.discountPercent || null,
          discount_amount_xaf: newRule.discountAmount || null,
          criteria,
          is_active: newRule.isActive,
        });
      
      // Update tutor discounts
      await supabase.rpc('update_tutor_discounts');
      
      alert('Discount rule created and applied!');
      setNewRule({
        name: '',
        description: '',
        discountPercent: 0,
        discountAmount: 0,
        criteria: { all: false, rating_min: '', rating_max: '', qualification: '', subject: '' },
        isActive: true,
      });
      loadPricing();
    } catch (error) {
      console.error('Error saving discount rule:', error);
      alert('Error saving discount rule');
    } finally {
      setSaving(false);
    }
  };

  const toggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      await supabase
        .from('tutor_discount_rules')
        .update({ is_active: !isActive })
        .eq('id', ruleId);
      
      await supabase.rpc('update_tutor_discounts');
      loadPricing();
    } catch (error) {
      console.error('Error toggling rule:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <div className="p-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Pricing Controls</h1>
        
        {/* Trial Session Pricing */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Trial Session Pricing</h2>
          <p className="text-gray-600 mb-6">Set the pricing for trial sessions. These prices will be displayed to users when booking trial sessions.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                30 Minutes Trial Session
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={trial30Price}
                  onChange={(e) => setTrial30Price(parseInt(e.target.value) || 0)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
                <span className="text-gray-600">XAF</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                60 Minutes Trial Session
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={trial60Price}
                  onChange={(e) => setTrial60Price(parseInt(e.target.value) || 0)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
                <span className="text-gray-600">XAF</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={saveTrialPricing}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Trial Pricing'}
          </button>
        </div>
        
        {/* Discount Rules */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Tutor Discount Rules</h2>
          <p className="text-gray-600 mb-6">Create discount rules that apply to tutors based on rating, qualification, or subject. You can risk up to 15% of platform revenue as discounts.</p>
          
          {/* New Rule Form */}
          <div className="border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Discount Rule</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rule Name</label>
                <input
                  type="text"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., High Rating Discount"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional description"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount %</label>
                <input
                  type="number"
                  value={newRule.discountPercent}
                  onChange={(e) => setNewRule({ ...newRule, discountPercent: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount Amount (XAF)</label>
                <input
                  type="number"
                  value={newRule.discountAmount}
                  onChange={(e) => setNewRule({ ...newRule, discountAmount: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">Use % OR amount, not both</p>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={newRule.criteria.all}
                  onChange={(e) => setNewRule({ ...newRule, criteria: { ...newRule.criteria, all: e.target.checked } })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">Apply to all tutors (platform-wide)</span>
              </label>
            </div>
            
            {!newRule.criteria.all && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Rating</label>
                  <input
                    type="number"
                    value={newRule.criteria.rating_min}
                    onChange={(e) => setNewRule({ ...newRule, criteria: { ...newRule.criteria, rating_min: e.target.value } })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="5"
                    step="0.1"
                    placeholder="e.g., 4.5"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Rating</label>
                  <input
                    type="number"
                    value={newRule.criteria.rating_max}
                    onChange={(e) => setNewRule({ ...newRule, criteria: { ...newRule.criteria, rating_max: e.target.value } })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="5"
                    step="0.1"
                    placeholder="e.g., 5.0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Qualification</label>
                  <input
                    type="text"
                    value={newRule.criteria.qualification}
                    onChange={(e) => setNewRule({ ...newRule, criteria: { ...newRule.criteria, qualification: e.target.value } })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., PhD, Master"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={newRule.criteria.subject}
                    onChange={(e) => setNewRule({ ...newRule, criteria: { ...newRule.criteria, subject: e.target.value } })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Mathematics"
                  />
                </div>
              </div>
            )}
            
            <button
              onClick={saveDiscountRule}
              disabled={saving || !newRule.name}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Discount Rule'}
            </button>
          </div>
          
          {/* Existing Rules */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Active Discount Rules</h3>
            {discountRules.length === 0 ? (
              <p className="text-gray-500">No discount rules created yet.</p>
            ) : (
              <div className="space-y-4">
                {discountRules.map((rule) => (
                  <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-800">{rule.name}</h4>
                          <span className={`px-2 py-1 rounded text-xs ${rule.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {rule.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {rule.description && (
                          <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm">
                          {rule.discount_percent > 0 && (
                            <span className="text-gray-700">
                              <strong>{rule.discount_percent}%</strong> discount
                            </span>
                          )}
                          {rule.discount_amount_xaf > 0 && (
                            <span className="text-gray-700">
                              <strong>{rule.discount_amount_xaf.toLocaleString()} XAF</strong> off
                            </span>
                          )}
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          Criteria: {JSON.stringify(rule.criteria)}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleRule(rule.id, rule.is_active)}
                        className={`px-4 py-2 rounded-lg text-sm ${
                          rule.is_active
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {rule.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

