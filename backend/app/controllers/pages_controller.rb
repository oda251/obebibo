class PagesController < ApplicationController
  
  def terms
  end

  def privacy
  end

  def inquiry
  end

  def create_inquiry
    # Simple inquiry form - in a real app, this would send an email
    redirect_to inquiry_path, notice: 'お問い合わせを受け付けました'
  end
end