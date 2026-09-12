import React, { useState, useEffect } from 'react';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import SectionHeader from '../../common/SectionHeader/SectionHeader';
import { pricingPlans } from '../../../data/pricing';
import { getCoursePlans } from '../../../services';
import { useEnrollmentModal } from '../../../context/EnrollmentContext';
import './PricingSection.css';

export default function PricingSection() {
  const { openEnrollmentModal } = useEnrollmentModal();
  const [plans, setPlans] = useState(pricingPlans);

  useEffect(() => {
    let isMounted = true;
    async function loadPlans() {
      const fetchedPlans = await getCoursePlans();
      if (fetchedPlans && fetchedPlans.length > 0 && isMounted) {
        setPlans(fetchedPlans);
      }
    }
    loadPlans();
    return () => { isMounted = false; };
  }, []);

  return (
    <section className="section pricing-section" id="pricing" aria-label="Course Pricing and Plans">
      <div className="container">
        <SectionHeader
          tag="💎 Transparent Investment"
          title="Simple, Transparent Pricing"
          subtitle="No hidden charges. Quality education that fits every budget."
        />

        <div className="pricing-grid">
          {plans.map((plan) => {
            const isPopular = plan.isPopular;

            return (
              <div
                key={plan.id}
                className={`pricing-card card ${isPopular ? 'pricing-card-popular' : 'pricing-card-standard'}`}
              >
                {isPopular && (
                  <div className="pricing-badge-popular">
                    <Sparkles size={13} className="badge-sparkle-icon" aria-hidden="true" />
                    <span>⭐ Most Popular</span>
                  </div>
                )}

                <div className="pricing-card-header">
                  <span className="pricing-plan-name">{plan.name}</span>
                  <div className="pricing-price-row">
                    <span className="pricing-price-currency">₹</span>
                    <span className="pricing-price-amount">{plan.price.replace('₹', '')}</span>
                    {plan.billing && (
                      <span className="pricing-price-billing">{plan.billing}</span>
                    )}
                  </div>
                  <p className="pricing-plan-desc">{plan.description}</p>
                </div>

                <div className="pricing-features-divider" aria-hidden="true" />

                <ul className="pricing-features-list" aria-label={`Features included in ${plan.name} plan`}>
                  {plan.features?.map((feature, idx) => (
                    <li key={idx} className="pricing-feature-item">
                      <span className="feature-check-wrapper" aria-hidden="true">
                        <Check size={14} className="feature-check-icon" />
                      </span>
                      <span className="feature-text">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="pricing-card-action">
                  <button
                    type="button"
                    onClick={(e) => openEnrollmentModal({ preferredPlan: plan.planValue }, e.currentTarget)}
                    className={`btn btn-lg pricing-cta-btn ${
                      isPopular
                        ? 'btn-primary pricing-btn-popular'
                        : 'btn-outline pricing-btn-standard'
                    }`}
                    aria-haspopup="dialog"
                    aria-label={`${plan.ctaText} with ${plan.name} plan`}
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pricing-bottom-notice">
          <p>
            🛡️ <strong>Flexible Learning Guarantee:</strong> Need custom corporate or group training plans?{' '}
            <a href="/contact" className="pricing-contact-link">Contact our advisory team</a> for institutional quotes.
          </p>
        </div>
      </div>
    </section>
  );
}
