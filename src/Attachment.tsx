import * as React from 'react';
import { Attachment, Button } from './BotConnection';
import { renderIfNonempty, konsole } from './Chat';
import { FormatState } from './Store';

export const AttachmentView = (props: {
    format: FormatState;
    attachment: Attachment,
    onClickButton: (type: string, value: string) => void,
    onImageLoad: () => void
}) => {
    if (!props.attachment) return;

    const attachment = props.attachment;

    const buttons = (buttons?: Button[]) => buttons &&
        <ul className="wc-card-buttons">
            { buttons.map((button, index) => <li key={ index }><button onClick={ () => props.onClickButton(button.type, button.value) }>{ button.title }</button></li>) }
        </ul>;

    const imageWithOnLoad = (url: string, thumbnailUrl?: string, autoPlay?:boolean, loop?: boolean) =>
        <img src={ url } autoPlay = { autoPlay } loop = { loop } poster = { thumbnailUrl } onLoad={ props.onImageLoad } />;

    const audio = (audioUrl: string, autoPlay?:boolean, loop?: boolean) =>
        <audio src={ audioUrl } autoPlay={ autoPlay } controls loop={ loop } />;

    const videoWithOnLoad = (videoUrl: string, thumbnailUrl?: string, autoPlay?:boolean, loop?: boolean) =>
        <video src={ videoUrl } poster={ thumbnailUrl } autoPlay={ autoPlay } controls loop={ loop } onLoadedMetadata={ props.onImageLoad } />;

    const attachedImage = (images?: { url: string }[]) =>
        images && images.length > 0 && imageWithOnLoad(images[0].url);

    const isGifMedia = (url: string): boolean => {
        return url.slice((url.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase() == 'gif';
    }

    const isUnsupportedCardContentType = (contentType: string): boolean => {
        let searchPattern = new RegExp('^application/vnd\.microsoft\.card\.', 'i');
        return searchPattern.test(contentType); 
    }

    const imageWithActionWithOnLoad = (image: {url: string, tap?: Button}, thumbnailUrl?: string, autoPlay?:boolean, loop?: boolean) => {
        if (!image.tap)
            return imageWithOnLoad(image.url);

        return <img src={ image.url } autoPlay = { autoPlay } loop = { loop } poster = { thumbnailUrl } onLoad={ props.onImageLoad } onClick={ () => props.onClickButton(image.tap.type, image.tap.value) } />;
    }

    const attachedImageWithAction = (images?: {url: string, tap?: Button}[]) =>
        images && images.length > 0 && imageWithActionWithOnLoad(images[0]);

    switch (attachment.contentType) {
        case "application/vnd.microsoft.card.hero":
            if (!attachment.content)
                return null;
            return (
                <div className='wc-card hero'>
                    { attachedImage(attachment.content.images) }
                    { renderIfNonempty(attachment.content.title, title => <h1>{title}</h1>) }
                    { renderIfNonempty(attachment.content.subtitle, subtitle => <h2>{subtitle}</h2>) }
                    { renderIfNonempty(attachment.content.text, text => <p>{text}</p>) }
                    { buttons(attachment.content.buttons) }
                </div>
            );

        case "application/vnd.microsoft.card.thumbnail":
            if (!attachment.content)
                return null;
            return (
                <div className='wc-card thumbnail'>
                    { renderIfNonempty(attachment.content.title, title => <h1>{title}</h1>) }
                    { attachedImage(attachment.content.images) }
                    { renderIfNonempty(attachment.content.subtitle, subtitle => <h2>{subtitle}</h2>) }
                    { renderIfNonempty(attachment.content.text, text => <p>{text}</p>) }
                    { buttons(attachment.content.buttons) }
                </div>
            );

        case "application/vnd.microsoft.card.video":
            if (!attachment.content || !attachment.content.media || attachment.content.media.length === 0)
                return null;
            return (
                <div className='wc-card video'>
                    { videoWithOnLoad(attachment.content.media[0].url, attachment.content.image ? attachment.content.image.url : null, attachment.content.autostart, attachment.content.autoloop) }
                    { renderIfNonempty(attachment.content.title, title => <h1>{title}</h1>) }
                    { renderIfNonempty(attachment.content.subtitle, subtitle => <h2>{subtitle}</h2>) }
                    { renderIfNonempty(attachment.content.text, text => <p>{text}</p>) }
                    { buttons(attachment.content.buttons) }
                </div>
            );


        case "application/vnd.microsoft.card.animation":
            if (!attachment.content || !attachment.content.media || attachment.content.media.length === 0)
                return null;            

            let contentFunction = isGifMedia(attachment.content.media[0].url) ? imageWithOnLoad : videoWithOnLoad; 

            return (
                <div className='wc-card animation'>
                    { contentFunction(attachment.content.media[0].url, attachment.content.image ? attachment.content.image.url : null, attachment.content.autostart, attachment.content.autoloop) }
                    { renderIfNonempty(attachment.content.title, title => <h1>{title}</h1>) }
                    { renderIfNonempty(attachment.content.subtitle, subtitle => <h2>{subtitle}</h2>) }
                    { renderIfNonempty(attachment.content.text, text => <p>{text}</p>) }
                    { buttons(attachment.content.buttons) }
                </div>
            );

        case "application/vnd.microsoft.card.audio":
            if (!attachment.content || !attachment.content.media || attachment.content.media.length === 0)
                return null;
            return (
                <div className='wc-card audio'>
                    { audio(attachment.content.media[0].url, attachment.content.autostart, attachment.content.autoloop) }
                    { renderIfNonempty(attachment.content.title, title => <h1>{title}</h1>) }
                    { renderIfNonempty(attachment.content.subtitle, subtitle => <h2>{subtitle}</h2>) }
                    { renderIfNonempty(attachment.content.text, text => <p>{text}</p>) }
                    { buttons(attachment.content.buttons) }
                </div>
            );

        case "application/vnd.microsoft.card.signin":
            if (!attachment.content)
                return null;
            return (
                <div className='wc-card signin'>
                    { renderIfNonempty(attachment.content.text, text => <h1>{text}</h1>) }
                    { buttons(attachment.content.buttons) }
                </div>
            );

        case "application/vnd.microsoft.card.receipt":
            if (!attachment.content)
                return null;
            return (
                <div className='wc-card receipt'>
                    <table>
                        <thead>
                            <tr>
                                <th colSpan={ 2 }>{ attachment.content.title }</th>
                            </tr>
                            { attachment.content.facts && attachment.content.facts.map((fact, i) => <tr key={'fact' + i}><th>{ fact.key }</th><th>{ fact.value }</th></tr>) }
                        </thead>
                        <tbody>{ attachment.content.items && attachment.content.items.map((item, i) =>
                            <tr key={'item' + i}>
                                <td>{ item.image && imageWithOnLoad(item.image.url) }<span>{ item.title }</span></td>
                                <td>{ item.price }</td>
                            </tr>) }
                        </tbody>
                        <tfoot>
                            { renderIfNonempty(
                                attachment.content.tax,
                                tax => <tr>
                                    <td>{ props.format.strings.receiptTax }</td>
                                    <td>{ attachment.content.tax }</td>
                                </tr>)
                            }
                            { renderIfNonempty(
                                attachment.content.total,
                                total => <tr className="total">
                                    <td>{ props.format.strings.receiptTotal }</td>
                                    <td>{ attachment.content.total }</td>
                                </tr>)
                            }
                        </tfoot>
                    </table>
                </div>
            );

        // only supported for 'skype' channel.
        case "application/vnd.microsoft.card.flex":
            if (!attachment.content)
                return null;
            return (
                <div className='wc-card flex'>
                    { attachedImageWithAction(attachment.content.images) }
                    { renderIfNonempty(attachment.content.title, title => <h1>{title}</h1>) }
                    { renderIfNonempty(attachment.content.subtitle, subtitle => <h2>{subtitle}</h2>) }
                    { renderIfNonempty(attachment.content.text, text => <p>{text}</p>) }
                    { buttons(attachment.content.buttons) }
                </div>
            );

        case "image/png":
        case "image/jpg":
        case "image/jpeg":
        case "image/gif":
            return imageWithOnLoad(attachment.contentUrl);

        case "audio/mpeg":
        case "audio/mp4":
            return audio(attachment.contentUrl);

        case "video/mp4":
            return videoWithOnLoad(attachment.contentUrl);

        default:
            if(isUnsupportedCardContentType(attachment['contentType'])) {
                return <span>{ props.format.strings.unknownCard.replace('%1', (attachment as any).contentType) }</span>;    
            }
            else {
                return <span>{ props.format.strings.unknownFile.replace('%1', (attachment as any).contentType) }</span>;
            }
            
    }
}