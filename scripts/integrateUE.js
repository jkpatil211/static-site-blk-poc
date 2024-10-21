(async function(){
    const publishHostUrl = document.currentScript?.dataset?.publishHost;
    if (!publishHostUrl) {
        console.error('Attribute "data-publish-host" is missing');
        return;
    }
    // const publishHostUrl = 'https://publish-p140494-e1434146.adobeaemcloud.com/';
    const authorHostMeta = document.querySelector('meta[name="urn:adobe:aue:system:aemconnection"]');
    if(!authorHostMeta) {
        console.error('Meta tag with content "urn:adobe:aue:system:aemconnection" is required');
        return;
    }
    const authorHostUrl = (authorHostMeta?.content || "")?.split('aem:').pop();

    async function fetchData(path) {
        let errorMessage;
        let data;

        try {
            const response = await fetch(`${path}?${Date.now()}`);
            data = await response.json();
            if (!response.ok) {
                console.error('apiError data', data);
                throw new Error(`Error with status ${response.status} while fetching the request. Please check the logs`)
            }
            // return data;
        } catch (error) {
            console.error(error.message);
        }

        return data?.data;
    }

    const nodes = document.querySelectorAll('*[data-aue-resource]');
    // console.log('Nodes-->', nodes);
    const bannerHeadline = nodes[0];
    
    console.log('bannerHeadline-->', bannerHeadline);
    const { graphKey, graphPath } = bannerHeadline?.dataset;

    if (!graphPath) {
        console.error('graphPath is required');
        return;
    }

    async function populateContent() {
        const data = await fetchData(`${publishHostUrl}graphql/execute.json/${graphPath}`);
        console.log('data', data);
        const item = data?.[graphKey]?.item;
        let contentFragmentKeys = Object.keys(item).filter(key => !key.startsWith('_'));
        // console.log('data item -->', item, contentFragmentKeys);
        contentFragmentKeys = [ ...contentFragmentKeys, 'subheadline' ];
    
        for (let i = 0; i <= contentFragmentKeys.length; i++) {
            const key = contentFragmentKeys[i];
            // check if this needs to be changed to data-aue-label
            const contentNode = bannerHeadline.querySelector(`*[data-aue-prop="${key}"]`);
            if (!contentNode) continue;
    
            if (contentNode?.dataset?.aueType === 'text') {
                contentNode.innerText = item?.[key];
            } else if (contentNode?.dataset?.aueType === "richtext") {
                contentNode.innerHTML = item?.[key]?.html;
            }
            console.log('contentNode->', contentNode);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        populateContent();
    });
})()