fetch('https://openrouter.ai/api/v1/models')
    .then(res => res.json())
    .then(data => {
        const freeVisionModels = data.data.filter(m =>
            m.pricing.prompt === '0' &&
            m.pricing.completion === '0' &&
            ((m.architecture && m.architecture.modality && typeof m.architecture.modality === 'string' && m.architecture.modality.toLowerCase().includes('image')) ||
                (m.architecture && m.architecture.modality && typeof m.architecture.modality === 'string' && m.architecture.modality.toLowerCase().includes('vision')))
        ).map(m => m.id);
        console.log("FREE VISION MODELS COUNT:", freeVisionModels.length);
        console.log(JSON.stringify(freeVisionModels, null, 2));
    })
    .catch(err => console.error(err));
