import type { APIRoute } from 'astro';
import { getCorsHeaders, withCors } from '@/lib/api/cors';

export const POST: APIRoute = async ({ request }) => {
    try {
        const formData = await request.formData();
        
        // Estrai i dati del form
        const nome = formData.get('nome') || formData.get('name');
        const email = formData.get('email');
        const telefono = formData.get('telefono') || formData.get('phone') || '';
        const messaggio = formData.get('messaggio') || formData.get('message');
        const oggetto = formData.get('subject') || formData.get('oggetto') || '';
        const privacy = formData.get('privacy');
        const turnstileToken = formData.get('cf-turnstile-response');

        // Converti in stringhe per sicurezza
        const nomeStr = nome ? nome.toString() : '';
        const emailStr = email ? email.toString() : '';
        const messaggioStr = messaggio ? messaggio.toString() : '';
        const telefonoStr = telefono ? telefono.toString() : '';
        const oggettoStr = oggetto ? oggetto.toString() : '';

        // Validazione
        if (!nomeStr || !emailStr || !messaggioStr) {
            return new Response(
                JSON.stringify({ 
                    success: false, 
                    error: 'I campi nome, email e messaggio sono obbligatori' 
                }),
                { 
                    status: 400,
                    headers: withCors({ 'Content-Type': 'application/json' })
                }
            );
        }

        // Validazione email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailStr)) {
            return new Response(
                JSON.stringify({ 
                    success: false, 
                    error: 'Email non valida' 
                }),
                { 
                    status: 400,
                    headers: withCors({ 'Content-Type': 'application/json' })
                }
            );
        }

        // Verifica privacy policy
        if (!privacy) {
            return new Response(
                JSON.stringify({ 
                    success: false, 
                    error: 'È necessario accettare la privacy policy' 
                }),
                { 
                    status: 400,
                    headers: withCors({ 'Content-Type': 'application/json' })
                }
            );
        }

        // Verifica Turnstile token
        const turnstileSecretKey = process.env.TURNSTILE_SECRET_KEY;
        if (turnstileSecretKey) {
            if (!turnstileToken || typeof turnstileToken !== 'string') {
                return new Response(
                    JSON.stringify({ 
                        success: false, 
                        error: 'Verifica di sicurezza mancante. Ricarica la pagina e riprova.' 
                    }),
                    { 
                        status: 400,
                        headers: withCors({ 'Content-Type': 'application/json' })
                    }
                );
            }

            // Verifica il token con Cloudflare Turnstile
            const turnstileVerifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
            const verifyResponse = await fetch(turnstileVerifyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    secret: turnstileSecretKey,
                    response: turnstileToken,
                    remoteip: request.headers.get('cf-connecting-ip') || 
                             request.headers.get('x-forwarded-for') || 
                             'unknown'
                }).toString()
            });

            const verifyResult = await verifyResponse.json();

            if (!verifyResult.success) {
                console.error('Turnstile verification failed:', verifyResult);
                return new Response(
                    JSON.stringify({ 
                        success: false, 
                        error: 'Verifica di sicurezza fallita. Ricarica la pagina e riprova.' 
                    }),
                    { 
                        status: 400,
                        headers: withCors({ 'Content-Type': 'application/json' })
                    }
                );
            }
        } else {
            // In sviluppo, se TURNSTILE_SECRET_KEY non è configurata, avvisa ma non blocca
            console.warn('TURNSTILE_SECRET_KEY non configurata - la verifica Turnstile è disabilitata');
        }

        // Configurazione Mailgun
        const mailgunDomain = process.env.MAILGUN_DOMAIN;
        const mailgunApiKey = process.env.MAILGUN_API_KEY;
        const recipientEmail = process.env.CONTACT_EMAIL;
        // Base URL per Mailgun: usa endpoint Europa di default
        // Per Mailgun USA usa: https://api.mailgun.net/v3/
        // Per Mailgun Europa usa: https://api.eu.mailgun.net/v3/
        const mailgunBaseUrl = process.env.MAILGUN_BASE_URL || 'https://api.eu.mailgun.net/v3/';

        if (!mailgunDomain || !mailgunApiKey || !recipientEmail) {
            console.error('Mailgun credentials mancanti:', {
                hasDomain: !!mailgunDomain,
                hasApiKey: !!mailgunApiKey,
                hasRecipientEmail: !!recipientEmail
            });
            return new Response(
                JSON.stringify({ 
                    success: false, 
                    error: 'Errore di configurazione del server' 
                }),
                { 
                    status: 500,
                    headers: withCors({ 'Content-Type': 'application/json' })
                }
            );
        }

        // Costruisci il corpo dell'email
        const subject = oggettoStr 
            ? `Nuovo contatto: ${oggettoStr}` 
            : 'Nuovo messaggio dal form contatti';
        
        const emailBody = `
Nuovo messaggio dal form contatti del sito

Nome: ${nomeStr}
Email: ${emailStr}
${telefonoStr ? `Telefono: ${telefonoStr}` : ''}
${oggettoStr ? `Oggetto: ${oggettoStr}` : ''}

Messaggio:
${messaggioStr}

---
Questo messaggio è stato inviato dal form contatti del sito web.
        `.trim();

        // Invia email tramite Mailgun (usa endpoint Europa)
        const mailgunUrl = `${mailgunBaseUrl}${mailgunDomain}/messages`;
        
        // Mailgun richiede FormData o URLSearchParams
        const mailgunParams = new URLSearchParams();
        mailgunParams.append('from', `Form Contatti <noreply@${mailgunDomain}>`);
        mailgunParams.append('to', recipientEmail || '');
        mailgunParams.append('subject', subject);
        mailgunParams.append('text', emailBody);
        mailgunParams.append('h:Reply-To', emailStr);

        // Crea l'autenticazione Basic per Mailgun
        const authString = `api:${mailgunApiKey}`;
        const authBase64 = Buffer.from(authString).toString('base64');

        const mailgunResponse = await fetch(mailgunUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authBase64}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: mailgunParams.toString()
        });

        if (!mailgunResponse.ok) {
            const errorText = await mailgunResponse.text();
            console.error('Errore Mailgun:', errorText);
            return new Response(
                JSON.stringify({ 
                    success: false, 
                    error: 'Errore durante l\'invio dell\'email' 
                }),
                { 
                    status: 500,
                    headers: withCors({ 'Content-Type': 'application/json' })
                }
            );
        }

        return new Response(
            JSON.stringify({ 
                success: true, 
                message: 'Messaggio inviato con successo!' 
            }),
            { 
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );

    } catch (error) {
        console.error('Errore nel processare la richiesta:', error);
        return new Response(
            JSON.stringify({ 
                success: false, 
                error: 'Si è verificato un errore. Riprova più tardi.' 
            }),
            { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(),
  });
};

