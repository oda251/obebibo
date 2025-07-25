class ReviewsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_campaign, only: [:create, :index]

  def index
    @reviews = @campaign.reviews.recent.page(params[:page]).per(10)
  end

  def create
    @review = @campaign.reviews.build(review_params.merge(user: current_user))
    
    if @review.save
      redirect_to campaign_path(@campaign), notice: 'レビューを投稿しました'
    else
      redirect_to campaign_path(@campaign), alert: 'レビューの投稿に失敗しました'
    end
  end

  private

  def set_campaign
    @campaign = Campaign.find(params[:id])
  end

  def review_params
    params.require(:review).permit(:rating, :comment)
  end
end