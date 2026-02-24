// Quick verification script for Agora package
try {
  const agora = require('agora-access-token');
  console.log('✅ agora-access-token package is installed');
  console.log('Available exports:', Object.keys(agora).slice(0, 10));
  
  if (agora.RtcTokenBuilder) {
    console.log('✅ RtcTokenBuilder is available');
  } else {
    console.log('❌ RtcTokenBuilder not found');
  }
  
  if (agora.RtcRole) {
    console.log('✅ RtcRole is available');
  } else {
    console.log('❌ RtcRole not found');
  }
} catch (error) {
  console.error('❌ Error loading agora-access-token:', error.message);
  process.exit(1);
}

