import { Request, Response } from "express";
import { transporter } from "~/configs/emailConfig";
import express from 'express'

const emailController = {

  sendEmail: async (req: Request, res: Response) => {

    const mailOptions = {
      from: 'Tranhunghp22112004@email.com',
      to: 'Tranhunghp22112004@gmail.com',
      subject: 'Sending HTML email using Node.js is a piece of cake',
      // text: 'That was easy!',
      // html: '<h1>Welcome</h1><p>That was easy!</p>'
      template: 'welcome',
    }

    await transporter.sendMail(mailOptions);
    res.status(200).json({ msg: `Send email successfully` })
    return;
  },

  sendEmailWithAttackment: async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];

    const attachments = files.map(file => ({
      filename: file.originalname,
      path: file.path,        
      contentType: file.mimetype
    }));

    const mailOptions = {
      from: 'Tranhunghp22112004@email.com',
      to: 'Tranhunghp22112004@gmail.com',
      subject: 'Sending HTML email using Node.js is a piece of cake',
      template: 'welcome',
      attachments: attachments
    }

    await transporter.sendMail(mailOptions);
    res.status(200).json({ msg: `Send email successfully` })
    return;


  }
}

export default emailController;