fetch('https://openrouter.ai/api/v1/models')
    .then(res => res.json())
    .then(data => {
        const allFreeModels = data.data.filter(m => m.pricing.prompt === '0' && m.pricing.completion === '0');
        console.log("ALL FREE MODELS COUNT:", allFreeModels.length);
        allFreeModels.forEach(m => {
            let isVision = false;
            if (m.architecture && m.architecture.modality && typeof m.architecture.modality === 'string') {
                const mod = m.architecture.modality.toLowerCase();
                if (mod.includes('image') || mod.includes('vision') || mod.includes('multimodal')) {
                    isVision = true;
                }
            }
            console.log(`- ${m.id} | Modality: ${m.architecture ? m.architecture.modality : 'unknown'} | Vision? ${isVision}`);
        });
    })
    .catch(err => console.error(err));
