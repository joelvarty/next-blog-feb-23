import { validatePreview, getDynamicPageURL } from "@agility/nextjs/node";

import { i18n } from "../../next.config"
// A simple example for testing it manually from your browser.
// If this is located at pages/api/preview.js, then
// open /api/preview from your browser.
export default async (req, res) => {

	//validate our preview key, also validate the requested page to preview exists
	const validationResp = await validatePreview({
		agilityPreviewKey: req.query.agilitypreviewkey,
		slug: req.query.slug
	});

	if (validationResp.error) {
		return res.status(401).end(`${validationResp.message}`)
	}

	let previewUrl = req.query.slug;

	//these kinds of dynamic links should work by default (even outside of preview)
	if (req.query.ContentID) {
		const dynamicPath = await getDynamicPageURL({ contentID: req.query.ContentID, preview: true, slug: req.query.slug });
		if (dynamicPath) {
			previewUrl = dynamicPath;
		}
	}

	if (req.query.lang && req.query.lang.toLowerCase() !== i18n.defaultLocale) {
		//prepend the language code onto the slug
		//if it's NOT the default language
		previewUrl = `/${req.query.lang}${previewUrl}`;
	}

	//enable preview mode
	res.setPreviewData({})

	// Redirect to the slug
	//Add a dummy querystring to the location header - since Netlify will keep the QS for the incoming request by default
	res.writeHead(307, { Location: `${previewUrl}?preview=1` })
	res.end()

}
