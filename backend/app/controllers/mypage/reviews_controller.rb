class Mypage::ReviewsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_campaign

  def new
    # Check if user has completed a campaign and can review
    @entry = current_user.entries.find_by(campaign: @campaign)
    redirect_to mypage_path, alert: 'このキャンペーンにレビューできません' unless can_review?
    
    @review = @campaign.reviews.build
  end

  def create
    @entry = current_user.entries.find_by(campaign: @campaign)
    redirect_to mypage_path, alert: 'このキャンペーンにレビューできません' unless can_review?
    
    @review = @campaign.reviews.build(review_params.merge(user: current_user))
    
    if @review.save
      redirect_to root_path, notice: 'レビューを投稿しました'
    else
      render :new, alert: 'レビューの投稿に失敗しました'
    end
  end

  private

  def set_campaign
    @campaign = Campaign.find(params[:id])
  end

  def can_review?
    return false unless @entry
    return false if current_user.reviews.exists?(campaign: @campaign)
    
    # User can review if they were a winner or if campaign is completed
    @entry.status == 'winner' || @campaign.end_at < Time.current
  end

  def review_params
    params.require(:review).permit(:rating, :comment)
  end
end