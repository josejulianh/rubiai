// Seed script to create Rubi Premium product in Stripe
// Run with: npx tsx scripts/seed-products.ts

import { getUncachableStripeClient } from '../server/stripeClient';

async function createProducts() {
  try {
    const stripe = await getUncachableStripeClient();
    
    // Check if product already exists
    const existingProducts = await stripe.products.search({ 
      query: "name:'Rubi Premium'" 
    });
    
    if (existingProducts.data.length > 0) {
      console.log('Rubi Premium already exists:', existingProducts.data[0].id);
      
      // Check for existing prices
      const prices = await stripe.prices.list({ 
        product: existingProducts.data[0].id,
        active: true 
      });
      
      if (prices.data.length > 0) {
        console.log('Price already exists:', prices.data[0].id);
        console.log('Monthly price:', prices.data[0].unit_amount! / 100, prices.data[0].currency);
        return;
      }
    }
    
    console.log('Creating Rubi Premium product...');
    
    // Create Rubi Premium product
    const product = await stripe.products.create({
      name: 'Rubi Premium',
      description: 'Tu asistente virtual personalizado. Personaliza el nombre, personalidad y estilo de Rubi. Incluye todas las funciones premium.',
      metadata: {
        type: 'subscription',
        features: 'custom_name,custom_personality,custom_tone,custom_color,priority_support',
      }
    });
    
    console.log('Created product:', product.id);
    
    // Create monthly price: €9.95/month
    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 995, // €9.95 in cents
      currency: 'eur',
      recurring: { interval: 'month' },
      metadata: {
        plan: 'monthly',
      }
    });
    
    console.log('Created monthly price:', monthlyPrice.id);
    console.log('Price: €9.95/month');
    
    // Create annual price with discount: €99.50/year (save 2 months)
    const yearlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 9950, // €99.50 in cents
      currency: 'eur',
      recurring: { interval: 'year' },
      metadata: {
        plan: 'yearly',
        savings: '2 months free',
      }
    });
    
    console.log('Created yearly price:', yearlyPrice.id);
    console.log('Price: €99.50/year (2 months free)');
    
    console.log('\n✅ Products created successfully!');
    console.log('Product ID:', product.id);
    console.log('Monthly Price ID:', monthlyPrice.id);
    console.log('Yearly Price ID:', yearlyPrice.id);
    
  } catch (error) {
    console.error('Error creating products:', error);
    process.exit(1);
  }
}

createProducts();
