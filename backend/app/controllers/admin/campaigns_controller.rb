class Admin::CampaignsController < Admin::ApplicationController
  before_action :set_campaign, only: [:show, :edit, :update, :destroy, :entries]

  def index
    @campaigns = Campaign.includes(:company).recent.page(params[:page]).per(20)
  end

  def show
  end

  def new
    @campaign = Campaign.new
    @companies = Company.all
  end

  def create
    @campaign = Campaign.new(campaign_params)
    
    if @campaign.save
      redirect_to admin_campaign_path(@campaign), notice: 'キャンペーンが作成されました'
    else
      @companies = Company.all
      render :new
    end
  end

  def edit
    @companies = Company.all
  end

  def update
    if @campaign.update(campaign_params)
      redirect_to admin_campaign_path(@campaign), notice: 'キャンペーンが更新されました'
    else
      @companies = Company.all
      render :edit
    end
  end

  def destroy
    @campaign.destroy
    redirect_to admin_campaigns_path, notice: 'キャンペーンが削除されました'
  end

  def entries
    @entries = @campaign.entries.includes(:user).recent.page(params[:page]).per(20)
  end

  private

  def set_campaign
    @campaign = Campaign.find(params[:id])
  end

  def campaign_params
    params.require(:campaign).permit(:company_id, :title, :description, :image_url, :start_at, :end_at, :status)
  end
end